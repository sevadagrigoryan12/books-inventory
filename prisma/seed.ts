import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    const booksData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'books.json'), 'utf-8')
    );

    for (const book of booksData) {
      await prisma.book.create({
        data: {
          title: book.title,
          authors: book.authors,
          genres: book.genres,
          sellPrice: book.prices.sell,
          borrowPrice: book.prices.borrow,
          stockPrice: book.prices.stock,
          copies: book.copies
        },
      });
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 