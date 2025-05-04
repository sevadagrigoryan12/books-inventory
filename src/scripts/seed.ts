import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

interface BookData {
  authors: string[];
  title: string;
  genres: string[];
  prices: {
    sell: number;
    borrow: number;
    stock: number;
  };
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

    try {
      const filePath = '/app/src/scripts/books.json';
      const booksData = JSON.parse(
        fs.readFileSync(filePath, 'utf-8')
      ) as BookData[];

      console.log(`Successfully read ${booksData.length} books from file`);

      for (const bookData of booksData) {
        await prisma.book.create({
          data: {
            authors: bookData.authors,
            title: bookData.title,
            genres: bookData.genres,
            sellPrice: bookData.prices.sell,
            borrowPrice: bookData.prices.borrow,
            stockPrice: bookData.prices.stock,
            copies: bookData.copies,
          },
        });
      }
      console.log('Additional books loaded from books.json');
    } catch (error) {
      console.log('No books.json file found, skipping additional books');
    }

    console.log('Database seeded successfully');
    console.log('Test user created with email: user@example.com');
    console.log('Test user ID:', testUser.id);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed(); 