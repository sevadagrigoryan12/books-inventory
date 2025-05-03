import request from 'supertest';
import app from '../../app';

describe('Health Controller', () => {
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
}); 