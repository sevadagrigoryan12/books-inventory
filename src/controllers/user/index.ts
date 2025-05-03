import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const getUserBooks = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const { type, status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      userId: email,
      type: type as string,
      status: status as string,
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

    res.json({
      books: userBooks.map((ub) => ({
        id: ub.id,
        type: ub.type,
        status: ub.status,
        createdAt: ub.createdAt,
        book: {
          id: ub.book.id,
          title: ub.book.title,
          authors: ub.book.authors,
        },
      })),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}; 