// Teste E2E para o fluxo de login e autenticação

describe('Login Flow', () => {
  beforeEach(() => {
    // Interceptar chamadas de API para mock
    cy.intercept('POST', '/api/auth/login', (req) => {
      // Login bem-sucedido para credenciais corretas
      if (req.body.email === 'test@example.com' && req.body.password === 'password123') {
        req.reply({
          statusCode: 200,
          body: {
            token: 'fake-jwt-token',
            refreshToken: 'fake-refresh-token',
            user: {
              id: '1',
              email: 'test@example.com',
              role: 'CLIENT',
              profile: {
                name: 'Test User',
              },
            },
          },
        });
      } else {
        // Falha de login para credenciais incorretas
        req.reply({
          statusCode: 401,
          body: {
            message: 'Credenciais inválidas',
          },
        });
      }
    });

    // Interceptar redirecionamento para dashboard após login
    cy.intercept('GET', '/api/users/me', {
      statusCode: 200,
      body: {
        id: '1',
        email: 'test@example.com',
        role: 'CLIENT',
        profile: {
          name: 'Test User',
        },
      },
    });

    // Interceptar chamadas para recuperação de senha
    cy.intercept('POST', '/api/auth/forgot-password', {
      statusCode: 200,
      body: {
        message: 'Instruções enviadas para o email',
      },
    });

    // Visitar a página de login antes de cada teste
    cy.visit('/login');
  });

  it('should display login form with all elements', () => {
    // Verificar título da página
    cy.get('h1').should('contain', 'Login');
    
    // Verificar campos e botões
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Entrar');
    
    // Verificar links
    cy.contains('a', 'Esqueceu sua senha?').should('exist');
    cy.contains('a', 'Não tem uma conta? Cadastre-se').should('exist');
  });

  it('should validate required fields', () => {
    // Tentar submeter o formulário vazio
    cy.get('button[type="submit"]').click();
    
    // Verificar mensagens de erro
    cy.get('[data-testid="email-error"]').should('contain', 'Email é obrigatório');
    cy.get('[data-testid="password-error"]').should('contain', 'Senha é obrigatória');
    
    // URL não deve mudar
    cy.url().should('include', '/login');
  });

  it('should validate email format', () => {
    // Preencher com email inválido
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('input[name="password"]').type('password123');
    
    // Submeter o formulário
    cy.get('button[type="submit"]').click();
    
    // Verificar mensagem de erro
    cy.get('[data-testid="email-error"]').should('contain', 'Email inválido');
    
    // URL não deve mudar
    cy.url().should('include', '/login');
  });

  it('should login successfully with valid credentials', () => {
    // Preencher com credenciais válidas
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    
    // Submeter o formulário
    cy.get('button[type="submit"]').click();
    
    // Verificar redirecionamento para dashboard
    cy.url().should('include', '/dashboard');
    
    // Verificar elementos do dashboard
    cy.get('[data-testid="user-welcome"]').should('contain', 'Bem-vindo, Test User');
    
    // Verificar armazenamento do token
    cy.window().its('localStorage.token').should('exist');
  });

  it('should show error message for invalid credentials', () => {
    // Preencher com credenciais inválidas
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('wrong-password');
    
    // Submeter o formulário
    cy.get('button[type="submit"]').click();
    
    // Verificar mensagem de erro
    cy.get('[data-testid="login-error"]').should('contain', 'Credenciais inválidas');
    
    // URL não deve mudar
    cy.url().should('include', '/login');
    
    // Token não deve existir no localStorage
    cy.window().its('localStorage.token').should('not.exist');
  });

  it('should navigate to forgot password page', () => {
    // Clicar no link "Esqueceu sua senha?"
    cy.contains('a', 'Esqueceu sua senha?').click();
    
    // Verificar redirecionamento
    cy.url().should('include', '/recuperar-senha');
    
    // Verificar elementos da página de recuperação de senha
    cy.get('h1').should('contain', 'Recuperar Senha');
    cy.get('input[name="email"]').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Enviar');
  });

  it('should navigate to register page', () => {
    // Clicar no link "Não tem uma conta? Cadastre-se"
    cy.contains('a', 'Não tem uma conta? Cadastre-se').click();
    
    // Verificar redirecionamento
    cy.url().should('include', '/registro');
    
    // Verificar elementos da página de registro
    cy.get('h1').should('contain', 'Criar Conta');
  });

  it('should request password recovery successfully', () => {
    // Navegar para a página de recuperação de senha
    cy.contains('a', 'Esqueceu sua senha?').click();
    
    // Verificar redirecionamento
    cy.url().should('include', '/recuperar-senha');
    
    // Preencher o email
    cy.get('input[name="email"]').type('test@example.com');
    
    // Submeter o formulário
    cy.get('button[type="submit"]').click();
    
    // Verificar mensagem de sucesso
    cy.get('[data-testid="success-message"]').should('contain', 'Instruções enviadas');
  });

  it('should handle session expiration', () => {
    // Simular login bem-sucedido
    cy.window().then((win) => {
      // Definir token expirado no localStorage
      win.localStorage.setItem('token', 'expired-token');
      win.localStorage.setItem('refreshToken', 'expired-refresh-token');
    });
    
    // Interceptar tentativa de refresh de token com erro
    cy.intercept('POST', '/api/auth/refresh-token', {
      statusCode: 401,
      body: {
        message: 'Token expirado',
      },
    });
    
    // Tentar acessar área protegida
    cy.visit('/dashboard');
    
    // Verificar redirecionamento para login
    cy.url().should('include', '/login');
    
    // Verificar mensagem de sessão expirada
    cy.get('[data-testid="session-expired"]').should('contain', 'Sua sessão expirou');
  });

  it('should maintain user session after page refresh', () => {
    // Preencher com credenciais válidas e fazer login
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Verificar que estamos no dashboard
    cy.url().should('include', '/dashboard');
    
    // Simular refresh da página
    cy.reload();
    
    // Verificar que ainda estamos no dashboard (sessão mantida)
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-welcome"]').should('contain', 'Bem-vindo, Test User');
  });
});