process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-minimum-32-characters-long';

import { signAccessToken, verifyAccessToken } from '../lib/jwt';

// Test data - a fake user payload we use to create tokens
const testUser = {
  sub: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
};

describe('JWT Tokens', () => {
  it('should create a token and verify it successfully', () => {
    const token = signAccessToken(testUser);

    // Token should be a string
    expect(typeof token).toBe('string');

    // Decoding the token should give back the same user info
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe('user-123');
    expect(decoded.email).toBe('test@example.com');
  });

  it('should throw an error if the token is tampered with', () => {
    const token = signAccessToken(testUser);

    // Mess up the end of the token to simulate tampering
    const tamperedToken = token.slice(0, -5) + 'XXXXX';

    expect(() => verifyAccessToken(tamperedToken)).toThrow();
  });
});
