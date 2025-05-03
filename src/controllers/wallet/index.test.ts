import request from 'supertest';
import app from '../../app';
import prisma from '../../config/prisma';

describe('Wallet Controller', () => {
  let server: any;
  let testUser: any;
  let testWallet: any;

  beforeAll(async () => {
    server = request(app);
    testUser = await prisma.user.create({
      data: {
        id: `test-user-wallet-${Date.now()}`,
        email: `test-wallet-${Date.now()}@example.com`,
        name: 'Test User',
      },
    });
    testWallet = await prisma.wallet.create({
      data: {
        userId: testUser.id,
        balance: 100,
      },
    });
  });

  afterAll(async () => {
    await prisma.walletMovement.deleteMany({
      where: {
        walletId: testWallet.id,
      },
    });
    await prisma.wallet.delete({
      where: { id: testWallet.id },
    });
    await prisma.user.delete({
      where: { id: testUser.id },
    });
  });

  describe('GET /api/wallets/:userId', () => {
    test('should return wallet details', async () => {
      const response = await server.get(`/api/wallets/${testUser.id}`);
      expect(response.status).toBe(200);
      expect(response.body.wallet.balance).toBe(100);
    });

    test('should return 404 for non-existent wallet', async () => {
      const response = await server.get('/api/wallets/nonexistent@example.com');
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/wallets/:userId/movements', () => {
    test('should create a wallet movement', async () => {
      const response = await server.post(`/api/wallets/${testUser.id}/movements`).send({
        amount: 50,
        type: 'CREDIT',
        description: 'Test movement',
      });
      expect(response.status).toBe(200);
      expect(response.body.movement.amount).toBe(50);
      expect(response.body.movement.type).toBe('CREDIT');
    });

    test('should return 404 for non-existent wallet', async () => {
      const response = await server.post('/api/wallets/nonexistent@example.com/movements').send({
        amount: 50,
        type: 'CREDIT',
        description: 'Test movement',
      });
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/wallets/:userId/movements', () => {
    test('should return wallet movements', async () => {
      const response = await server.get(`/api/wallets/${testUser.id}/movements`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.movements)).toBe(true);
    });

    test('should filter movements by type', async () => {
      const response = await server.get(`/api/wallets/${testUser.id}/movements?type=CREDIT`);
      expect(response.status).toBe(200);
      expect(response.body.movements.every((m: any) => m.type === 'CREDIT')).toBe(true);
    });

    test('should return 404 for non-existent wallet', async () => {
      const response = await server.get('/api/wallets/nonexistent@example.com/movements');
      expect(response.status).toBe(404);
    });
  });
}); 