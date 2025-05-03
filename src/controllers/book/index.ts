import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../../config/prisma';
import { sendEmail } from '../../utils/email';
import { BookActionType, UserBookType, UserBookStatus } from '../../types/enums';
import { AppError } from '../../utils/error';
import { scheduleJob } from 'node-schedule';

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

const scheduleBookRestock = (bookId: number, copies: number) => {
  const oneHourLater = new Date();
  oneHourLater.setHours(oneHourLater.getHours() + 1);

  scheduleJob(oneHourLater, async () => {
    try {
      await prisma.book.update({
        where: { id: bookId },
        data: { copies: { increment: copies } },
      });

      const book = await prisma.book.findUnique({ where: { id: bookId } });
      if (book) {
        await sendEmail({
          to: 'management@library.com',
          subject: 'Book Restocked',
          text: `Book "${book.title}" by ${book.authors.join(', ')} has been automatically restocked. New stock: ${book.copies} copies.`,
        });
      }
    } catch (error) {
      console.error('Failed to restock book:', error);
    }
  });
};

export const searchBooks = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { query, author, genre, page = '1', limit = '10' } = req.query as {
      query?: string;
      author?: string;
      genre?: string;
      page?: string;
      limit?: string;
    };
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.BookWhereInput = {
      OR: [
        query ? { title: { contains: query } } : {},
        query ? { authors: { has: query } } : {},
        query ? { genres: { has: query } } : {},
      ],
      authors: author ? { has: author } : undefined,
      genres: genre ? { has: genre } : undefined,
    };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: Number(limit),
      }),
      prisma.book.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        books,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    throw new AppError(500, 'Failed to search books', error);
  }
};

export const getBookDetails = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const book = await prisma.book.findUnique({
      where: { id: Number(id) },
    });

    if (!book) {
      throw new AppError(404, 'Book not found');
    }

    return res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Failed to get book details', error);
  }
};

export const getBookActions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { actionType, userId, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      bookId: Number(id),
      actionType: actionType as BookActionType,
      userId: userId as string,
    };

    const [actions, total] = await Promise.all([
      prisma.bookAction.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bookAction.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        actions,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    throw new AppError(500, 'Failed to get book actions', error);
  }
};

export const borrowBook = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userEmail = req.headers['user-email'] as string;

    const [book, userBorrowedBooks] = await Promise.all([
      prisma.book.findUnique({ where: { id: Number(id) } }),
      prisma.userBook.findMany({
        where: {
          userId: userEmail,
          type: UserBookType.BORROWED,
          status: UserBookStatus.ACTIVE,
        },
      }),
    ]);

    if (!book) {
      throw new AppError(404, 'Book not found');
    }

    if (book.copies < 1) {
      throw new AppError(400, 'No copies available');
    }

    if (userBorrowedBooks.length >= 3) {
      throw new AppError(400, 'Maximum borrowing limit reached');
    }

    const existingBorrow = userBorrowedBooks.find((ub: { bookId: number }) => ub.bookId === book.id);
    if (existingBorrow) {
      throw new AppError(400, 'Book already borrowed');
    }

    await prisma.$transaction(async (tx: TransactionClient) => {
      await tx.book.update({
        where: { id: book.id },
        data: { copies: { decrement: 1 } },
      });

      await tx.userBook.create({
        data: {
          userId: userEmail,
          bookId: book.id,
          type: UserBookType.BORROWED,
          status: UserBookStatus.ACTIVE,
        },
      });

      await tx.bookAction.create({
        data: {
          book: { connect: { id: book.id } },
          userId: userEmail,
          actionType: BookActionType.BORROW,
        },
      });

      if (book.copies === 1) {
        await sendEmail({
          to: 'management@library.com',
          subject: 'Low Stock Alert',
          text: `Book "${book.title}" by ${book.authors.join(', ')} has only 1 copy left. It will be automatically restocked in 1 hour.`,
        });
        scheduleBookRestock(book.id, 5); // Restock with 5 copies after 1 hour
      }
    });

    return res.json({
      success: true,
      message: 'Book borrowed successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Failed to borrow book', error);
  }
};

export const returnBook = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userEmail = req.headers['user-email'] as string;

    const [book, userBook] = await Promise.all([
      prisma.book.findUnique({ where: { id: Number(id) } }),
      prisma.userBook.findFirst({
        where: {
          userId: userEmail,
          bookId: Number(id),
          type: UserBookType.BORROWED,
          status: UserBookStatus.ACTIVE,
        },
      }),
    ]);

    if (!book) {
      throw new AppError(404, 'Book not found');
    }

    if (!userBook) {
      throw new AppError(400, 'Book not borrowed by user');
    }

    await prisma.$transaction(async (tx: TransactionClient) => {
      await tx.book.update({
        where: { id: book.id },
        data: { copies: { increment: 1 } },
      });

      await tx.userBook.update({
        where: { id: userBook.id },
        data: { status: UserBookStatus.RETURNED },
      });

      await tx.bookAction.create({
        data: {
          book: { connect: { id: book.id } },
          userId: userEmail,
          actionType: BookActionType.RETURN,
        },
      });
    });

    return res.json({
      success: true,
      message: 'Book returned successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Failed to return book', error);
  }
};

export const buyBook = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;
    const userEmail = req.headers['user-email'] as string;

    if (quantity < 1 || quantity > 2) {
      throw new AppError(400, 'You can only buy 1-2 copies of the same book');
    }

    const [book, userBoughtBooks, userBook] = await Promise.all([
      prisma.book.findUnique({ where: { id: Number(id) } }),
      prisma.userBook.findMany({
        where: {
          userId: userEmail,
          type: UserBookType.BOUGHT,
        },
      }),
      prisma.userBook.findFirst({
        where: {
          userId: userEmail,
          bookId: Number(id),
          type: UserBookType.BOUGHT,
        },
      }),
    ]);

    if (!book) {
      throw new AppError(404, 'Book not found');
    }

    if (book.copies < quantity) {
      throw new AppError(400, 'Not enough copies available');
    }

    if (userBoughtBooks.length >= 10) {
      throw new AppError(400, 'Maximum buying limit reached');
    }

    if (userBook) {
      throw new AppError(400, 'Book already purchased');
    }

    await prisma.$transaction(async (tx: TransactionClient) => {
      await tx.book.update({
        where: { id: book.id },
        data: { copies: { decrement: quantity } },
      });

      await tx.userBook.create({
        data: {
          userId: userEmail,
          bookId: book.id,
          type: UserBookType.BOUGHT,
          status: UserBookStatus.ACTIVE,
        },
      });

      await tx.bookAction.create({
        data: {
          book: { connect: { id: book.id } },
          userId: userEmail,
          actionType: BookActionType.BUY,
          quantity,
        },
      });

      if (book.copies === 1) {
        await sendEmail({
          to: 'management@library.com',
          subject: 'Low Stock Alert',
          text: `Book "${book.title}" by ${book.authors.join(', ')} has only 1 copy left. Please restock.`,
        });
      }
    });

    return res.json({
      success: true,
      message: 'Book purchased successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Failed to buy book', error);
  }
};

export const getUserBooks = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;
    const { type, status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      userId,
      ...(type && { type: type as UserBookType }),
      ...(status && { status: status as UserBookStatus }),
    };

    const [userBooks, total] = await Promise.all([
      prisma.userBook.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          book: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userBook.count({ where }),
    ]);

    return res.json({
      userBooks,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 