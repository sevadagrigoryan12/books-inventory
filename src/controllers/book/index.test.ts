import request from 'supertest';
import app from '../../app';
import prisma from '../../config/prisma';

describe('Book Controller', () => {
  let server: any;
  let testUser: any;
  let testBook: any;

  beforeAll(async () => {
    server = request(app);
    testUser = await prisma.user.create({
      data: {
        id: `test-user-book-${Date.now()}`,
        email: `test-book-${Date.now()}@example.com`,
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

  describe('GET /api/books', () => {
    test('should return all books', async () => {
      const response = await server.get('/api/books');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.books)).toBe(true);
    });

    test('should filter books by title', async () => {
      const response = await server.get('/api/books?title=Test');
      expect(response.status).toBe(200);
      expect(response.body.books.every((b: any) => b.title.includes('Test'))).toBe(true);
    });

    test('should filter books by author', async () => {
      const response = await server.get('/api/books?author=Test');
      expect(response.status).toBe(200);
      expect(response.body.books.every((b: any) => b.authors.includes('Test Author'))).toBe(true);
    });

    test('should filter books by genre', async () => {
      const response = await server.get('/api/books?genre=Test');
      expect(response.status).toBe(200);
      expect(response.body.books.every((b: any) => b.genres.includes('Test Genre'))).toBe(true);
    });
  });

  describe('GET /api/books/:id', () => {
    test('should return a book by id', async () => {
      const response = await server.get(`/api/books/${testBook.id}`);
      expect(response.status).toBe(200);
      expect(response.body.book.title).toBe('Test Book');
    });

    test('should return 404 for non-existent book', async () => {
      const response = await server.get('/api/books/999999');
      expect(response.status).toBe(404);
    });
  });

  describe('borrowBook', () => {
    test('should successfully borrow a book', async () => {
      const response = await server.post(`/api/books/${testBook.id}/borrow`).set('user-email', testUser.email);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should not allow borrowing when no copies available', async () => {
      // First, borrow all available copies
      for (let i = 0; i < testBook.copies; i++) {
        await server.post(`/api/books/${testBook.id}/borrow`).set('user-email', testUser.email);
      }
      // Try to borrow one more
      const response = await server.post(`/api/books/${testBook.id}/borrow`).set('user-email', testUser.email);
      expect(response.status).toBe(400);
    });
  });

  describe('returnBook', () => {
    test('should successfully return a book', async () => {
      // First borrow the book
      await server.post(`/api/books/${testBook.id}/borrow`).set('user-email', testUser.email);
      // Then return it
      const response = await server.post(`/api/books/${testBook.id}/return`).set('user-email', testUser.email);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('buyBook', () => {
    test('should successfully buy a book', async () => {
      const response = await server.post(`/api/books/${testBook.id}/buy`).set('user-email', testUser.email).send({
        quantity: 1,
      });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should not allow buying more than 2 copies', async () => {
      const response = await server.post(`/api/books/${testBook.id}/buy`).set('user-email', testUser.email).send({
        quantity: 3,
      });
      expect(response.status).toBe(400);
    });
  });

  describe('getUserBooks', () => {
    test('should return user books', async () => {
      const response = await server.get(`/api/users/${testUser.email}/books`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.userBooks)).toBe(true);
    });
  });
}); 