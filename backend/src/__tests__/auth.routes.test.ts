process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-minimum-32-characters-long';

import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn(), create: jest.fn() },
    refreshToken: { create: jest.fn(), deleteMany: jest.fn() },
    category: { createMany: jest.fn() },
  },
}));

import prisma from '../lib/prisma';

const mockPrisma = prisma as any;

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user and returns a token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
      });
      mockPrisma.category.createMany.mockResolvedValue({ count: 12 });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('returns 409 if the email is already taken', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'taken@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(409);
    });

    it('returns 400 if required fields are missing', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in successfully with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('mypassword', 10);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'mypassword',
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('returns 401 if the user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'somepassword',
      });

      expect(res.status).toBe(401);
    });
  });
});
