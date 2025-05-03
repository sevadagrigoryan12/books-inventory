import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface BookData {
  authorName: string;
  bookTitle: string;
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

    // Create wallet if not exists
    const wallet = await prisma.wallet.findFirst();
    if (!wallet) {
      await prisma.wallet.create({
        data: {
          balance: 100.00,
        },
      });
    }

    // Create books
    for (const bookData of booksData) {
      await prisma.book.create({
        data: {
          authorName: bookData.authorName,
          bookTitle: bookData.bookTitle,
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