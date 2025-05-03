import request, { SuperTest, Test } from 'supertest';
import app from 'app';

describe('Health Controller', () => {
  let server: SuperTest<Test>;

  beforeAll(() => {
    server = request(app);
  });

  describe('GET /health', () => {
    test('should return status message', async () => {
      const response = await server.get('/api/health');

      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('date', expect.anything());
    });
  });
}); 