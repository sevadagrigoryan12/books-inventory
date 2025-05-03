import { Request, Response } from 'express';
import { PrismaClient, Prisma, BookActionType, UserBookType, UserBookStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import { sendEmail } from '../../utils/email';
import { AppError, NotFoundError, BusinessError, ValidationError } from '../../utils/error';
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
    const { title, author, genre, page = '1', limit = '10' } = req.query as {
      title?: string;
      author?: string;
      genre?: string;
      page?: string;
      limit?: string;
    };
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.BookWhereInput = {
      ...(title && { title: { contains: title } }),
      ...(author && { authors: { has: author } }),
      ...(genre && { genres: { has: genre } }),
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
      books,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
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
      const error = new NotFoundError('Book');
      return res.status(error.statusCode).json({
        success: false,
        type: error.name,
        message: error.message,
      });
    }

    return res.json({
      book,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        type: error.name,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      type: 'InternalServerError',
      message: 'Failed to get book details',
    });
  }
};

export const getBookActions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { actionType, userId, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.BookActionWhereInput = {
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
      actions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to get book actions', error);
  }
};

export const borrowBook = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'] as string;

    if (!userId) {
      throw new ValidationError('User ID is required', { userId: 'User ID is required' });
    }

    const [book, user, userBorrowedBooks] = await Promise.all([
      prisma.book.findUnique({ where: { id: Number(id) } }),
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.userBook.findMany({
        where: {
          userId: userId,
          type: UserBookType.BORROWED,
          status: UserBookStatus.ACTIVE,
        },
      }),
    ]);

    if (!book) {
      throw new NotFoundError('Book');
    }

    if (!user) {
      throw new NotFoundError('User');
    }

    if (book.copies < 1) {
      throw new BusinessError('No copies available');
    }

    if (userBorrowedBooks.length >= 3) {
      throw new BusinessError('Maximum borrowing limit reached');
    }

    const existingBorrow = userBorrowedBooks.find((ub: { bookId: number }) => ub.bookId === book.id);
    if (existingBorrow) {
      throw new BusinessError('Book already borrowed');
    }

    await prisma.$transaction(async (tx: TransactionClient) => {
      await tx.book.update({
        where: { id: book.id },
        data: { copies: { decrement: 1 } },
      });

      await tx.userBook.create({
        data: {
          userId: userId,
          bookId: book.id,
          type: UserBookType.BORROWED,
          status: UserBookStatus.ACTIVE,
        },
      });

      await tx.bookAction.create({
        data: {
          book: { connect: { id: book.id } },
          user: { connect: { id: userId } },
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

    return res.json({ success: true, message: 'Book borrowed successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        type: error.name,
        message: error.message,
        ...(error instanceof ValidationError && { errors: error.details }),
      });
    }
    return res.status(500).json({
      success: false,
      type: 'InternalServerError',
      message: 'Failed to borrow book',
    });
  }
};

export const returnBook = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userEmail = req.headers['user-email'] as string;

    const [book, user, userBook] = await Promise.all([
      prisma.book.findUnique({ where: { id: Number(id) } }),
      prisma.user.findFirst({ where: { email: userEmail } }),
      prisma.userBook.findFirst({
        where: {
          user: { email: userEmail },
          bookId: Number(id),
          type: UserBookType.BORROWED,
          status: UserBookStatus.ACTIVE,
        },
      }),
    ]);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!userBook) {
      return res.status(400).json({ error: 'Book not borrowed by user' });
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
          user: { connect: { id: user.id } },
          actionType: BookActionType.RETURN,
        },
      });
    });

    return res.json({
      success: true,
      message: 'Book returned successfully',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to return book' });
  }
};

export const buyBook = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userEmail = req.headers['user-email'] as string;
    const { quantity = 1 } = req.body;

    if (quantity > 2) {
      return res.status(400).json({ error: 'Cannot buy more than 2 copies' });
    }

    const [book, user, userBoughtBooks] = await Promise.all([
      prisma.book.findUnique({ where: { id: Number(id) } }),
      prisma.user.findFirst({ where: { email: userEmail } }),
      prisma.userBook.findMany({
        where: {
          user: { email: userEmail },
          type: UserBookType.BOUGHT,
          status: UserBookStatus.ACTIVE,
        },
      }),
    ]);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (book.copies < quantity) {
      return res.status(400).json({ error: 'Not enough copies available' });
    }

    const existingBuy = userBoughtBooks.find((ub: { bookId: number }) => ub.bookId === book.id);
    if (existingBuy) {
      return res.status(400).json({ error: 'Book already bought' });
    }

    await prisma.$transaction(async (tx: TransactionClient) => {
      await tx.book.update({
        where: { id: book.id },
        data: { copies: { decrement: quantity } },
      });

      await tx.userBook.create({
        data: {
          userId: user.id,
          bookId: book.id,
          type: UserBookType.BOUGHT,
          status: UserBookStatus.ACTIVE,
        },
      });

      await tx.bookAction.create({
        data: {
          book: { connect: { id: book.id } },
          user: { connect: { id: user.id } },
          actionType: BookActionType.BUY,
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
      message: 'Book bought successfully',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to buy book' });
  }
};

export const getUserBooks = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.params;
    const { type, status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      userId: email,
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

    if (!userBooks.length) {
      throw new AppError(404, 'No books found for user');
    }

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
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Failed to get user books', error);
  }
}; 