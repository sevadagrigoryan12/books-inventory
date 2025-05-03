import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { sendEmail } from '../../utils/email';
import { $Enums } from '@prisma/client';

export const getWalletBalance = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;
    const wallet = await prisma.wallet.findFirst({
      where: { userId }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    return res.json({ wallet });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const addWalletMovement = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;
    const { amount, type, description } = req.body;

    if (!amount || !type) {
      return res.status(400).json({ error: 'Amount and type are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    if (!Object.values($Enums.WalletMovementType).includes(type)) {
      return res.status(400).json({ error: 'Invalid movement type' });
    }

    const wallet = await prisma.wallet.findFirst({
      where: { userId }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const newBalance = type === $Enums.WalletMovementType.CREDIT ? wallet.balance + amount : wallet.balance - amount;
      if (newBalance < 0) {
        throw new Error('Insufficient funds');
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      const movement = await tx.walletMovement.create({
        data: {
          walletId: wallet.id,
          amount,
          type,
          description: description || `Movement by user ${userId}`,
        },
      });

      return { wallet: updatedWallet, movement };
    });

    if (result.wallet.balance > 2000) {
      await sendEmail({
        to: 'management@dummy-library.com',
        subject: 'Wallet Milestone Reached!',
        text: `User ${userId} has reached a wallet balance of ${result.wallet.balance}!`,
      });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMovements = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;
    const { type, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const wallet = await prisma.wallet.findFirst({
      where: { userId }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const where = {
      walletId: wallet.id,
      ...(type && { type: type as $Enums.WalletMovementType })
    };

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

export const updateBalance = async (amount: number, type: $Enums.WalletMovementType, description: string): Promise<number> => {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findFirst();
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const newBalance = type === $Enums.WalletMovementType.CREDIT ? wallet.balance + amount : wallet.balance - amount;
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