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
    await prisma.bookAction.deleteMany({
      where: {
        userId: 'test-user-id'
      }
    });

    await prisma.userBook.deleteMany({
      where: {
        userId: 'test-user-id'
      }
    });

    await prisma.wallet.deleteMany({
      where: {
        userId: 'test-user-id'
      }
    });

    await prisma.user.deleteMany({
      where: {
        email: 'user@example.com'
      }
    });

    const testUser = await prisma.user.create({
      data: {
        id: 'test-user-id',
        email: 'user@example.com',
        name: 'Test User'
      }
    });

    const wallet = await prisma.wallet.findFirst({
      where: { userId: testUser.id }
    });
    
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

    const testBook = await prisma.book.create({
      data: {
        authors: ['Test Author'],
        title: 'Test Book',
        genres: ['Test Genre'],
        sellPrice: 10.00,
        borrowPrice: 1.00,
        stockPrice: 5.00,
        copies: 5,
      },
    });

    try {
      const booksData = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../../books.json'), 'utf-8')
      ) as BookData[];

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
    } catch (error) {
      console.log('No books.json file found, skipping additional books');
    }

    console.log('Database seeded successfully');
    console.log('Test user created with email: user@example.com');
    console.log('Test user ID:', testUser.id);
    console.log('Test book created with ID:', testBook.id);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed(); 