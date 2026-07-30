import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  beforeEach(() => {
    jwtStrategy = new JwtStrategy();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(jwtStrategy).toBeDefined();
    });

    it('should have name "jwt"', () => {
      expect(jwtStrategy.name).toBe('jwt');
    });

    it('should be an instance of JwtStrategy', () => {
      expect(jwtStrategy).toBeInstanceOf(JwtStrategy);
    });
  });

  describe('validate', () => {
    it('should validate and transform a valid JWT payload', () => {
      const payload = {
        sub: 1,
        email: 'test@example.com',
        role: 'user',
      };

      const result = jwtStrategy.validate(payload);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        role: 'user',
      });
    });

    it('should map sub to id', () => {
      const payload = {
        sub: 42,
        email: 'admin@example.com',
        role: 'admin',
      };

      const result = jwtStrategy.validate(payload);

      expect(result.id).toBe(42);
      expect(result.email).toBe('admin@example.com');
      expect(result.role).toBe('admin');
    });

    it('should handle numeric sub correctly', () => {
      const payload = {
        sub: 999,
        email: 'user@test.com',
        role: 'moderator',
      };

      const result = jwtStrategy.validate(payload);

      expect(result.id).toBe(999);
      expect(typeof result.id).toBe('number');
    });

    it('should preserve email field', () => {
      const payload = {
        sub: 1,
        email: 'john.doe@example.com',
        role: 'user',
      };

      const result = jwtStrategy.validate(payload);

      expect(result.email).toBe('john.doe@example.com');
    });

    it('should preserve role field', () => {
      const payload = {
        sub: 1,
        email: 'test@example.com',
        role: 'superadmin',
      };

      const result = jwtStrategy.validate(payload);

      expect(result.role).toBe('superadmin');
    });

    it('should return object with id, email, and role properties', () => {
      const payload = {
        sub: 5,
        email: 'verify@test.com',
        role: 'guest',
      };

      const result = jwtStrategy.validate(payload);

      expect(Object.keys(result)).toContain('id');
      expect(Object.keys(result)).toContain('email');
      expect(Object.keys(result)).toContain('role');
      expect(Object.keys(result).length).toBe(3);
    });

    it('should not include sub in returned object', () => {
      const payload = {
        sub: 1,
        email: 'test@example.com',
        role: 'user',
      };

      const result = jwtStrategy.validate(payload);

      expect(Object.keys(result)).not.toContain('sub');
    });

    it('should handle payload with different user roles', () => {
      const roles = ['admin', 'user', 'moderator', 'guest'];

      roles.forEach((role) => {
        const payload = {
          sub: 1,
          email: 'test@example.com',
          role,
        };

        const result = jwtStrategy.validate(payload);

        expect(result.role).toBe(role);
      });
    });

    it('should handle different user IDs', () => {
      const userIds = [1, 100, 999, 12345];

      userIds.forEach((userId) => {
        const payload = {
          sub: userId,
          email: 'test@example.com',
          role: 'user',
        };

        const result = jwtStrategy.validate(payload);

        expect(result.id).toBe(userId);
      });
    });

    it('should handle different email formats', () => {
      const emails = [
        'user@example.com',
        'john.doe@example.co.uk',
        'test+tag@example.com',
        'user123@subdomain.example.com',
      ];

      emails.forEach((email) => {
        const payload = {
          sub: 1,
          email,
          role: 'user',
        };

        const result = jwtStrategy.validate(payload);

        expect(result.email).toBe(email);
      });
    });

    it('should return new object, not the same reference', () => {
      const payload = {
        sub: 1,
        email: 'test@example.com',
        role: 'user',
      };

      const result = jwtStrategy.validate(payload);

      expect(result).not.toBe(payload);
    });
  });
});
