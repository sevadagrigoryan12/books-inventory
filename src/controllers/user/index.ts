import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { $Enums } from '@prisma/client';

export const getUserBooks = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.params;

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { type, status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      userId: user.id,
      ...(type && { type: type as $Enums.UserBookType }),
      ...(status && { status: status as $Enums.UserBookStatus }),
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
      userBooks: userBooks.map((ub) => ({
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
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 