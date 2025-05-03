import request, { SuperTest, Test } from 'supertest';
import app from '../../app';
import prisma from '../../config/prisma';
import { BookActionType, UserBookType, UserBookStatus } from '../../types/enums';

describe('Book Controller', () => {
  let server: SuperTest<Test>;
  let testBook: any;
  let testUser: any;

  beforeAll(async () => {
    server = request(app);
    // Create test data
    testBook = await prisma.book.create({
      data: {
        title: 'Test Book',
        authors: ['Test Author'],
        genres: ['Test Genre'],
        sellPrice: 10,
        borrowPrice: 5,
        stockPrice: 1,
        copies: 2,
      },
    });
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });
  });

  afterAll(async () => {
    await prisma.userBook.deleteMany({
      where: {
        userId: testUser.email,
      },
    });
    await prisma.bookAction.deleteMany({
      where: {
        bookId: testBook.id,
      },
    });
    await prisma.book.delete({
      where: { id: testBook.id },
    });
    await prisma.user.delete({
      where: { email: testUser.email },
    });
  });

  describe('searchBooks', () => {
    test('should return books matching search criteria', async () => {
      const response = await server.get('/api/books?query=Test&author=Test&genre=Test');
      expect(response.status).toBe(200);
      expect(response.body.books).toHaveLength(1);
      expect(response.body.books[0].bookTitle).toBe('Test Book');
    });
  });

  describe('getBookDetails', () => {
    test('should return book details', async () => {
      const response = await server.get(`/api/books/${testBook.id}`);
      expect(response.status).toBe(200);
      expect(response.body.bookTitle).toBe('Test Book');
    });

    test('should return 404 for non-existent book', async () => {
      const response = await server.get('/api/books/999');
      expect(response.status).toBe(404);
    });
  });

  describe('borrowBook', () => {
    test('should successfully borrow a book', async () => {
      const response = await server
        .post(`/api/books/${testBook.id}/borrow`)
        .set('user-email', testUser.email);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should not allow borrowing when no copies available', async () => {
      // First borrow all copies
      await server
        .post(`/api/books/${testBook.id}/borrow`)
        .set('user-email', 'another@example.com');
      
      const response = await server
        .post(`/api/books/${testBook.id}/borrow`)
        .set('user-email', testUser.email);
      expect(response.status).toBe(400);
    });
  });

  describe('returnBook', () => {
    test('should successfully return a book', async () => {
      // First borrow the book
      await server
        .post(`/api/books/${testBook.id}/borrow`)
        .set('user-email', testUser.email);

      const response = await server
        .post(`/api/books/${testBook.id}/return`)
        .set('user-email', testUser.email);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('buyBook', () => {
    test('should successfully buy a book', async () => {
      const response = await server
        .post(`/api/books/${testBook.id}/buy`)
        .set('user-email', testUser.email)
        .send({ quantity: 1 });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should not allow buying more than 2 copies', async () => {
      const response = await server
        .post(`/api/books/${testBook.id}/buy`)
        .set('user-email', testUser.email)
        .send({ quantity: 3 });
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