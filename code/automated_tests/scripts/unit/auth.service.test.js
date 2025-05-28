// Teste unitário para o serviço de autenticação

const AuthService = require('../../../../src/backend/src/services/auth.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { prisma } = require('../../../../src/backend/src/config/prisma');

// Mock de dependências
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('../../../../src/backend/src/config/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return token and user data when credentials are valid', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'CLIENT',
        profile: {
          name: 'Test User',
        },
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValueOnce('access_token');
      jwt.sign.mockReturnValueOnce('refresh_token');
      prisma.refreshToken.create.mockResolvedValue({ token: 'refresh_token' });

      // Act
      const result = await AuthService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { profile: true },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(prisma.refreshToken.create).toHaveBeenCalled();
      
      expect(result).toEqual({
        token: 'access_token',
        refreshToken: 'refresh_token',
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'CLIENT',
          profile: {
            name: 'Test User',
          },
        },
      });
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        AuthService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Credenciais inválidas');
    });

    it('should throw error when password is invalid', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed_password',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(
        AuthService.login({
          email: 'test@example.com',
          password: 'wrong_password',
        })
      ).rejects.toThrow('Credenciais inválidas');
    });
  });

  describe('refreshToken', () => {
    it('should generate new tokens when refresh token is valid', async () => {
      // Arrange
      const mockRefreshTokenData = {
        id: '1',
        token: 'valid_refresh_token',
        userId: '1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'CLIENT',
        profile: {
          name: 'Test User',
        },
      };

      prisma.refreshToken.findFirst.mockResolvedValue(mockRefreshTokenData);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValueOnce('new_access_token');
      jwt.sign.mockReturnValueOnce('new_refresh_token');
      prisma.refreshToken.delete.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({
        token: 'new_refresh_token',
      });

      // Act
      const result = await AuthService.refreshToken('valid_refresh_token');

      // Assert
      expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith({
        where: { token: 'valid_refresh_token' },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { profile: true },
      });
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.refreshToken.create).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledTimes(2);

      expect(result).toEqual({
        token: 'new_access_token',
        refreshToken: 'new_refresh_token',
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'CLIENT',
          profile: {
            name: 'Test User',
          },
        },
      });
    });

    it('should throw error when refresh token is not found', async () => {
      // Arrange
      prisma.refreshToken.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        AuthService.refreshToken('invalid_refresh_token')
      ).rejects.toThrow('Token inválido ou expirado');
    });

    it('should throw error when refresh token is expired', async () => {
      // Arrange
      const mockRefreshTokenData = {
        id: '1',
        token: 'expired_refresh_token',
        userId: '1',
        expiresAt: new Date(Date.now() - 1000), // Expired
      };

      prisma.refreshToken.findFirst.mockResolvedValue(mockRefreshTokenData);

      // Act & Assert
      await expect(
        AuthService.refreshToken('expired_refresh_token')
      ).rejects.toThrow('Token inválido ou expirado');
    });
  });

  describe('logout', () => {
    it('should delete refresh token', async () => {
      // Arrange
      prisma.refreshToken.findFirst.mockResolvedValue({
        id: '1',
        token: 'refresh_token',
      });
      prisma.refreshToken.delete.mockResolvedValue({});

      // Act
      await AuthService.logout('refresh_token');

      // Assert
      expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith({
        where: { token: 'refresh_token' },
      });
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should not throw error when refresh token is not found', async () => {
      // Arrange
      prisma.refreshToken.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.logout('nonexistent_token')).resolves.not.toThrow();
      expect(prisma.refreshToken.delete).not.toHaveBeenCalled();
    });
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      // Arrange
      bcrypt.hash.mockResolvedValue('hashed_password');

      // Act
      const result = await AuthService.hashPassword('password123');

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(result).toBe('hashed_password');
    });
  });
});