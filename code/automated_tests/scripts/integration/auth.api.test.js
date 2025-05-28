// Teste de integração para a API de autenticação

const request = require('supertest');
const { app } = require('../../../../src/backend/src/app');
const { prisma } = require('../../../../src/backend/src/config/prisma');
const { hashPassword } = require('../../../../src/backend/src/services/auth.service');

// Este teste requer que o banco de dados de teste esteja configurado
// e que o app esteja exportando a instância do Express

describe('Auth API Integration Tests', () => {
  let testUser;
  let refreshToken;
  
  // Configuração antes de todos os testes
  beforeAll(async () => {
    // Limpar dados de teste existentes
    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          email: 'test-integration@example.com',
        },
      },
    });
    
    await prisma.clientProfile.deleteMany({
      where: {
        user: {
          email: 'test-integration@example.com',
        },
      },
    });
    
    await prisma.profile.deleteMany({
      where: {
        user: {
          email: 'test-integration@example.com',
        },
      },
    });
    
    await prisma.user.deleteMany({
      where: {
        email: 'test-integration@example.com',
      },
    });
    
    // Criar usuário de teste
    testUser = await prisma.user.create({
      data: {
        email: 'test-integration@example.com',
        password: await hashPassword('password123'),
        role: 'CLIENT',
        profile: {
          create: {
            name: 'Test Integration User',
            phone: '1234567890',
          },
        },
        clientProfile: {
          create: {
            companyName: 'Test Company',
            cnpj: '12345678901234',
            segment: 'Technology',
          },
        },
      },
      include: {
        profile: true,
        clientProfile: true,
      },
    });
  });
  
  // Limpeza após todos os testes
  afterAll(async () => {
    // Limpar dados de teste
    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          email: 'test-integration@example.com',
        },
      },
    });
    
    await prisma.clientProfile.deleteMany({
      where: {
        user: {
          email: 'test-integration@example.com',
        },
      },
    });
    
    await prisma.profile.deleteMany({
      where: {
        user: {
          email: 'test-integration@example.com',
        },
      },
    });
    
    await prisma.user.deleteMany({
      where: {
        email: 'test-integration@example.com',
      },
    });
    
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
  });
  
  describe('POST /api/auth/login', () => {
    it('should return 200 and tokens when credentials are valid', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-integration@example.com',
          password: 'password123',
        });
      
      // Guardar o refresh token para uso em outros testes
      refreshToken = response.body.refreshToken;
      
      // Verificações
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test-integration@example.com');
      expect(response.body.user.role).toBe('CLIENT');
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    it('should return 401 when password is incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-integration@example.com',
          password: 'wrong-password',
        });
      
      // Verificações
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/credenciais inválidas/i);
    });
    
    it('should return 401 when user does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });
      
      // Verificações
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/credenciais inválidas/i);
    });
    
    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});
      
      // Verificações
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });
  
  describe('POST /api/auth/refresh-token', () => {
    it('should return new tokens when refresh token is valid', async () => {
      // Verificar se temos um refresh token dos testes anteriores
      if (!refreshToken) {
        throw new Error('Refresh token não disponível. O teste de login falhou?');
      }
      
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refreshToken,
        });
      
      // Atualizar o refresh token para uso em outros testes
      refreshToken = response.body.refreshToken;
      
      // Verificações
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test-integration@example.com');
    });
    
    it('should return 401 when refresh token is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refreshToken: 'invalid-refresh-token',
        });
      
      // Verificações
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/token inválido ou expirado/i);
    });
    
    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({});
      
      // Verificações
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });
  
  describe('POST /api/auth/logout', () => {
    it('should successfully logout with valid refresh token', async () => {
      // Verificar se temos um refresh token dos testes anteriores
      if (!refreshToken) {
        throw new Error('Refresh token não disponível. Os testes anteriores falharam?');
      }
      
      const response = await request(app)
        .post('/api/auth/logout')
        .send({
          refreshToken,
        });
      
      // Verificações
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/logout realizado com sucesso/i);
      
      // Refresh token não deve mais ser válido
      const refreshResponse = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refreshToken,
        });
      
      expect(refreshResponse.status).toBe(401);
    });
    
    it('should return 200 even when refresh token is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({
          refreshToken: 'invalid-refresh-token',
        });
      
      // Verificações - ainda deve retornar 200 para não revelar informações sobre tokens
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/logout realizado com sucesso/i);
    });
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      // Gerar email único para evitar conflitos
      const uniqueEmail = `test-register-${Date.now()}@example.com`;
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: uniqueEmail,
          password: 'password123',
          confirmPassword: 'password123',
          role: 'CLIENT',
          profile: {
            name: 'Test Register User',
            phone: '9876543210',
          },
          clientProfile: {
            companyName: 'New Test Company',
            cnpj: '43210987654321',
            segment: 'Services',
          },
        });
      
      // Verificações
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toBe(uniqueEmail);
      expect(response.body).toHaveProperty('role');
      expect(response.body.role).toBe('CLIENT');
      expect(response.body).not.toHaveProperty('password');
      
      // Limpar usuário criado
      await prisma.clientProfile.deleteMany({
        where: {
          user: {
            email: uniqueEmail,
          },
        },
      });
      
      await prisma.profile.deleteMany({
        where: {
          user: {
            email: uniqueEmail,
          },
        },
      });
      
      await prisma.user.deleteMany({
        where: {
          email: uniqueEmail,
        },
      });
    });
    
    it('should return 400 when email already exists', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test-integration@example.com', // Email já existente
          password: 'password123',
          confirmPassword: 'password123',
          role: 'CLIENT',
          profile: {
            name: 'Duplicate User',
            phone: '9876543210',
          },
          clientProfile: {
            companyName: 'Duplicate Company',
            cnpj: '43210987654321',
            segment: 'Services',
          },
        });
      
      // Verificações
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/email já está em uso/i);
    });
    
    it('should validate password confirmation', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'new-user@example.com',
          password: 'password123',
          confirmPassword: 'different-password', // Diferente da senha
          role: 'CLIENT',
          profile: {
            name: 'Password Mismatch User',
            phone: '9876543210',
          },
        });
      
      // Verificações
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.some(error => 
        error.includes('confirmação de senha'))).toBe(true);
    });
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          // Campos obrigatórios ausentes
        });
      
      // Verificações
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });
});