process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-minimum-32-characters-long';

import request from 'supertest';
import app from '../app';

// Simple test to check the server is running
describe('Health Check', () => {
  it('should return 200 and status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should return 404 for routes that do not exist', async () => {
    const res = await request(app).get('/api/this-does-not-exist');

    expect(res.status).toBe(404);
  });
});
