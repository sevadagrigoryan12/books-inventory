import request from 'supertest';
import app from '../../app';
import prisma from '../../config/prisma';
import { $Enums } from '@prisma/client';

describe('User Controller', () => {
  let server: any;
  let testUser: any;
  let testBook: any;

  beforeAll(async () => {
    server = request(app);
    testUser = await prisma.user.create({
      data: {
        id: `test-user-controller-${Date.now()}`,
        email: `test-user-${Date.now()}@example.com`,
        name: 'Test User',
      },
    });
    testBook = await prisma.book.create({
      data: {
        title: 'Test Book',
        authors: ['Test Author'],
        genres: ['Test Genre'],
        sellPrice: 10.99,
        borrowPrice: 1.99,
        stockPrice: 5.99,
        copies: 5,
      },
    });

    await prisma.userBook.create({
      data: {
        userId: testUser.id,
        bookId: testBook.id,
        type: $Enums.UserBookType.BORROWED,
        status: $Enums.UserBookStatus.ACTIVE,
      },
    });
  });

  afterAll(async () => {
    await prisma.bookAction.deleteMany({
      where: {
        bookId: testBook.id,
      },
    });
    await prisma.userBook.deleteMany({
      where: {
        userId: testUser.id,
      },
    });
    await prisma.book.delete({
      where: { id: testBook.id },
    });
    await prisma.user.delete({
      where: { id: testUser.id },
    });
  });

  describe('getUserBooks', () => {
    test('should return user books', async () => {
      const response = await server.get(`/api/users/${testUser.email}/books`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.userBooks)).toBe(true);
      expect(response.body.userBooks[0].type).toBe('BORROWED');
    });

    test('should filter books by type', async () => {
      const response = await server.get(`/api/users/${testUser.email}/books?type=BORROWED`);
      expect(response.status).toBe(200);
      expect(response.body.userBooks.every((b: any) => b.type === 'BORROWED')).toBe(true);
    });

    test('should filter books by status', async () => {
      const response = await server.get(`/api/users/${testUser.email}/books?status=ACTIVE`);
      expect(response.status).toBe(200);
      expect(response.body.userBooks.every((b: any) => b.status === 'ACTIVE')).toBe(true);
    });

    test('should return 404 for non-existent user', async () => {
      const response = await server.get('/api/users/nonexistent@example.com/books');
      expect(response.status).toBe(404);
    });
  });
}); 