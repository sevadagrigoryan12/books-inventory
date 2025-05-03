import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface BookData {
  authors: string[];
  title: string;
  genres: string[];
  sellPrice: number;
  borrowPrice: number;
  stockPrice: number;
  copies: number;
}

async function seed() {
  try {
    // Read books data from JSON file
    const booksData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../books.json'), 'utf-8')
    ) as BookData[];

    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    // Create wallet if not exists
    const wallet = await prisma.wallet.findFirst();
    if (!wallet) {
      await prisma.wallet.create({
        data: {
          balance: 100.00,
          user: {
            connect: {
              id: testUser.id,
            },
          },
        },
      });
    }

    // Create books
    for (const bookData of booksData) {
      await prisma.book.create({
        data: {
          authors: bookData.authors,
          title: bookData.title,
          genres: bookData.genres,
          sellPrice: bookData.sellPrice,
          borrowPrice: bookData.borrowPrice,
          stockPrice: bookData.stockPrice,
          copies: bookData.copies,
        },
      });
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed(); 