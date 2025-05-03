import request from 'supertest';
import app from '../app';

describe('Routes', () => {
  let server: any;

  beforeAll(() => {
    server = request(app);
  });

  describe('GET /health', () => {
    test('should return 200 OK', async () => {
      const response = await server.get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('date');
    });
  });

  describe('GET /not-found', () => {
    test('should return 404 Not Found', async () => {
      const response = await server.get('/not-found');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: 'Not Found',
      });
    });
  });
});
