import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { sendEmail } from '../../utils/email';
import { WalletMovementType } from '../../types/enums';

export const getWalletBalance = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const wallet = await prisma.wallet.findFirst();

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    return res.json({ balance: wallet.balance });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const addWalletMovement = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { amount, type } = req.body;
    const userEmail = req.headers['user-email'] as string;

    if (!amount || !type) {
      return res.status(400).json({ error: 'Amount and type are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    if (!Object.values(WalletMovementType).includes(type)) {
      return res.status(400).json({ error: 'Invalid movement type' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findFirst();
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const newBalance = type === WalletMovementType.CREDIT ? wallet.balance + amount : wallet.balance - amount;
      if (newBalance < 0) {
        throw new Error('Insufficient funds');
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      await tx.walletMovement.create({
        data: {
          walletId: wallet.id,
          amount,
          type,
          description: `Movement by user ${userEmail}`,
        },
      });

      return updatedWallet;
    });

    if (result.balance > 2000) {
      await sendEmail({
        to: 'management@dummy-library.com',
        subject: 'Wallet Milestone Reached!',
        text: `User ${userEmail} has reached a wallet balance of ${result.balance}!`,
      });
    }

    return res.json({ balance: result.balance });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMovements = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = type ? { type: type as string } : {};

    const [movements, total] = await Promise.all([
      prisma.walletMovement.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.walletMovement.count({ where }),
    ]);

    return res.json({
      movements,
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

export const updateBalance = async (amount: number, type: WalletMovementType, description: string): Promise<number> => {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findFirst();
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const newBalance = type === WalletMovementType.CREDIT ? wallet.balance + amount : wallet.balance - amount;
    if (newBalance < 0) {
      throw new Error('Insufficient funds');
    }

    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    });

    await tx.walletMovement.create({
      data: {
        walletId: wallet.id,
        amount,
        type,
        description,
      },
    });

    if (newBalance > 2000) {
      await sendEmail({
        to: 'management@dummy-library.com',
        subject: 'Wallet Milestone Reached',
        text: `Congratulations! The wallet balance has exceeded $2000. Current balance: $${newBalance}`,
      });
    }

    return newBalance;
  });
}; 