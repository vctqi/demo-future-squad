# Plano de Testes Automatizados - Marketplace de Benefícios para Clientes PJ

## Informações do Documento
- **Projeto**: Marketplace de Benefícios para Clientes PJ
- **Data**: 2025-05-27
- **Versão**: 1.0
- **Autor(es)**: QA Team

## Visão Geral da Estratégia de Testes

Este documento apresenta a estratégia completa de testes automatizados para o projeto "Marketplace de Benefícios para Clientes PJ", abrangendo testes unitários, de integração, end-to-end (E2E) e de performance. A estratégia foi elaborada com base nos requisitos do produto, na arquitetura do sistema e no backlog de desenvolvimento, garantindo uma cobertura abrangente das funcionalidades implementadas.

A abordagem adotada visa garantir:
- Validação da qualidade em múltiplas camadas da aplicação
- Detecção precoce de problemas
- Facilidade de manutenção e extensão dos testes
- Cobertura mínima de 80% do código
- Validação completa dos fluxos críticos de negócio
- Testes de regressão automatizados

## Escopo de Testes

### Inclui:
- **Frontend**:
  - Componentes React
  - Integração entre componentes
  - Estado da aplicação (Redux)
  - Fluxos de usuário completos
  - Validação de formulários
  - Responsividade (viewports principais)

- **Backend**:
  - Controladores/rotas da API
  - Serviços de negócio
  - Acesso a dados (Prisma)
  - Middleware de autenticação e autorização
  - Integrações entre serviços internos

- **Fluxos Críticos**:
  - Autenticação e autorização
  - Cadastro e aprovação de fornecedores
  - Cadastro e aprovação de serviços
  - Busca e navegação de serviços
  - Contratação e pagamento
  - Geração e gestão de contratos
  - Dashboards (cliente, fornecedor, admin)
  - Sistema de recomendação
  - Gestão de disputas

### Exclui:
- Testes de usabilidade (serão realizados manualmente)
- Testes de acessibilidade profundos (será usado apenas validação básica WCAG)
- Testes de penetração de segurança (será realizado por equipe especializada)
- Testes de carga extrema (além do escopo do MVP)
- Integrações com sistemas bancários externos (simulados no MVP)

## Tipos de Testes

| Tipo de Teste | Descrição | Ferramenta | Cobertura Alvo |
|---------------|-----------|------------|----------------|
| Unitários | Testes isolados de componentes, funções e classes | Jest, React Testing Library | 85% |
| Integração | Testes da comunicação entre componentes e serviços | Jest, Supertest | 80% |
| API | Validação dos endpoints REST e seus comportamentos | Supertest, Postman | 90% |
| UI | Validação de fluxos completos via interface | Cypress | Fluxos críticos (100%) |
| Performance | Tempo de resposta e eficiência de operações críticas | k6 | Operações principais < 2s |
| Segurança | Validação básica de autenticação e autorização | Jest, Cypress | Fluxos de auth (100%) |

## Ambiente de Testes

| Ambiente | Propósito | Configuração | URL |
|----------|-----------|--------------|-----|
| Dev | Testes durante desenvolvimento | Docker local com dados mock | http://localhost:3000 |
| CI | Testes automatizados no pipeline | Containers isolados em GitHub Actions | N/A |
| QA | Testes integrados em ambiente dedicado | Réplica de produção com dados sintéticos | http://qa.marketplace-benefits.example.com |

## Ferramentas e Dependências

### Frontend
- **Jest**: Framework de testes para JavaScript/TypeScript
- **React Testing Library**: Biblioteca para testes de componentes React
- **Cypress**: Framework para testes E2E
- **MSW (Mock Service Worker)**: Para mock de APIs em testes

### Backend
- **Jest**: Framework de testes unitários
- **Supertest**: Biblioteca para testes de API
- **Testcontainers**: Para testes com dependências externas (banco de dados, Redis)
- **Faker**: Geração de dados de teste

### Performance
- **k6**: Ferramenta para testes de carga e performance

### Monitoramento e Relatórios
- **Jest Coverage**: Relatórios de cobertura de código
- **Cypress Dashboard**: Relatórios de testes E2E
- **GitHub Actions**: Integração contínua e relatórios automatizados

## Casos de Teste Principais

### Autenticação e Autorização

| ID | Módulo | Descrição | Pré-condições | Passos | Resultado Esperado | Prioridade |
|----|--------|-----------|---------------|--------|-------------------|------------|
| AUTH-TC001 | Autenticação | Login com credenciais válidas | Usuário cadastrado no sistema | 1. Acessar página de login<br>2. Inserir email e senha válidos<br>3. Clicar em "Entrar" | Usuário autenticado e redirecionado para dashboard correspondente ao seu perfil | Alta |
| AUTH-TC002 | Autenticação | Login com credenciais inválidas | N/A | 1. Acessar página de login<br>2. Inserir email e/ou senha inválidos<br>3. Clicar em "Entrar" | Mensagem de erro informando credenciais inválidas | Alta |
| AUTH-TC003 | Autenticação | Recuperação de senha | Usuário cadastrado no sistema | 1. Acessar página de login<br>2. Clicar em "Esqueci minha senha"<br>3. Inserir email<br>4. Seguir instruções de redefinição | Email enviado e senha redefinida com sucesso | Média |
| AUTH-TC004 | Autorização | Acesso a rotas protegidas sem autenticação | N/A | 1. Tentar acessar rota protegida sem autenticação | Redirecionamento para página de login | Alta |
| AUTH-TC005 | Autorização | Acesso a rotas administrativas por usuário não-admin | Usuário comum autenticado | 1. Autenticar como usuário comum<br>2. Tentar acessar rota administrativa | Acesso negado (403) | Alta |

### Fornecedores e Serviços

| ID | Módulo | Descrição | Pré-condições | Passos | Resultado Esperado | Prioridade |
|----|--------|-----------|---------------|--------|-------------------|------------|
| FORN-TC001 | Cadastro | Cadastro de novo fornecedor | N/A | 1. Acessar página de cadastro de fornecedor<br>2. Preencher formulário com dados válidos<br>3. Enviar formulário | Fornecedor cadastrado com status "Pendente de Aprovação" | Alta |
| FORN-TC002 | Cadastro | Validação de campos obrigatórios | N/A | 1. Acessar página de cadastro de fornecedor<br>2. Enviar formulário sem preencher campos obrigatórios | Mensagens de erro nos campos obrigatórios | Alta |
| FORN-TC003 | Aprovação | Aprovação de fornecedor | Fornecedor cadastrado com status pendente<br>Admin autenticado | 1. Logar como admin<br>2. Acessar lista de fornecedores pendentes<br>3. Aprovar fornecedor | Status do fornecedor alterado para "Aprovado" | Alta |
| SERV-TC001 | Serviços | Cadastro de novo serviço | Fornecedor aprovado e autenticado | 1. Logar como fornecedor<br>2. Acessar "Meus Serviços"<br>3. Adicionar novo serviço<br>4. Preencher detalhes e preços<br>5. Enviar | Serviço cadastrado com status "Pendente de Aprovação" | Alta |
| SERV-TC002 | Serviços | Aprovação de serviço | Serviço cadastrado com status pendente<br>Admin autenticado | 1. Logar como admin<br>2. Acessar lista de serviços pendentes<br>3. Aprovar serviço | Status do serviço alterado para "Aprovado" e disponível no catálogo | Alta |

### Descoberta e Contratação

| ID | Módulo | Descrição | Pré-condições | Passos | Resultado Esperado | Prioridade |
|----|--------|-----------|---------------|--------|-------------------|------------|
| DISC-TC001 | Busca | Busca por palavra-chave | Serviços aprovados no sistema | 1. Acessar página inicial<br>2. Inserir palavra-chave na busca<br>3. Submeter busca | Resultados relevantes exibidos, ordenados por relevância | Alta |
| DISC-TC002 | Busca | Filtros avançados | Serviços aprovados no sistema | 1. Acessar página de busca<br>2. Aplicar filtros (categoria, preço, avaliação)<br>3. Submeter busca | Resultados filtrados corretamente | Média |
| DISC-TC003 | Detalhes | Visualização de detalhes do serviço | Serviços aprovados no sistema | 1. Buscar serviço<br>2. Clicar em um resultado<br>3. Visualizar página de detalhes | Detalhes completos do serviço exibidos | Alta |
| RECOM-TC001 | Recomendação | Recomendações baseadas no perfil | Cliente PJ autenticado | 1. Logar como cliente PJ<br>2. Acessar dashboard<br>3. Verificar seção de recomendações | Recomendações relevantes ao perfil da empresa exibidas | Média |
| CONTR-TC001 | Contratação | Fluxo completo de contratação | Cliente PJ autenticado<br>Serviço disponível | 1. Logar como cliente PJ<br>2. Selecionar serviço<br>3. Iniciar contratação<br>4. Preencher informações<br>5. Confirmar contratação<br>6. Simular pagamento | Contrato gerado e serviço registrado como contratado | Alta |

### Dashboards e Gestão

| ID | Módulo | Descrição | Pré-condições | Passos | Resultado Esperado | Prioridade |
|----|--------|-----------|---------------|--------|-------------------|------------|
| DASH-TC001 | Dashboard Cliente | Visualização de serviços contratados | Cliente PJ autenticado com serviços contratados | 1. Logar como cliente PJ<br>2. Acessar dashboard<br>3. Verificar lista de serviços contratados | Lista completa e detalhes dos serviços contratados exibidos | Alta |
| DASH-TC002 | Dashboard Fornecedor | Visualização de contratos ativos | Fornecedor autenticado com serviços contratados | 1. Logar como fornecedor<br>2. Acessar dashboard<br>3. Verificar contratos ativos | Lista e detalhes dos contratos ativos exibidos | Alta |
| ADMIN-TC001 | Painel Admin | Visualização de métricas da plataforma | Admin autenticado | 1. Logar como admin<br>2. Acessar painel administrativo<br>3. Verificar seção de métricas | Métricas atualizadas e corretas exibidas | Alta |
| ADMIN-TC002 | Relatórios | Geração de relatório customizado | Admin autenticado | 1. Logar como admin<br>2. Acessar seção de relatórios<br>3. Definir parâmetros<br>4. Gerar relatório | Relatório gerado corretamente | Média |
| ADMIN-TC003 | Disputas | Resolução de disputa | Admin autenticado<br>Disputa aberta no sistema | 1. Logar como admin<br>2. Acessar disputas<br>3. Selecionar disputa<br>4. Analisar e propor resolução<br>5. Finalizar disputa | Disputa marcada como resolvida | Alta |

## Suítes de Teste

| Suíte | Casos de Teste | Objetivo | Quando Executar |
|-------|----------------|----------|-----------------|
| Smoke Tests | AUTH-TC001, FORN-TC001, SERV-TC001, DISC-TC001, CONTR-TC001, DASH-TC001 | Validar funcionalidades críticas | A cada commit na branch principal |
| Regression Tests | Todos | Garantir que novas alterações não quebrem funcionalidades existentes | Antes de cada release |
| Auth Suite | AUTH-TC001 a AUTH-TC005 | Validar sistema de autenticação e autorização | Após alterações no módulo de autenticação |
| Supplier Suite | FORN-TC001 a FORN-TC003, SERV-TC001, SERV-TC002 | Validar fluxo de fornecedores e serviços | Após alterações no módulo de fornecedores |
| Client Suite | DISC-TC001 a DISC-TC003, RECOM-TC001, CONTR-TC001 | Validar fluxo de descoberta e contratação | Após alterações no módulo de clientes |
| Dashboard Suite | DASH-TC001, DASH-TC002 | Validar dashboards de usuários | Após alterações nos dashboards |
| Admin Suite | ADMIN-TC001 a ADMIN-TC003 | Validar painel administrativo | Após alterações no módulo administrativo |
| Performance Suite | [Casos de performance] | Validar tempo de resposta e eficiência | Semanalmente e antes de releases |

## Matriz de Rastreabilidade

| ID Requisito | Descrição | Casos de Teste |
|--------------|-----------|----------------|
| REQ-AUTH-001 | Sistema de autenticação seguro | AUTH-TC001, AUTH-TC002, AUTH-TC003, AUTH-TC004, AUTH-TC005 |
| REQ-FORN-001 | Cadastro e aprovação de fornecedores | FORN-TC001, FORN-TC002, FORN-TC003 |
| REQ-SERV-001 | Cadastro e gestão de serviços | SERV-TC001, SERV-TC002 |
| REQ-DISC-001 | Busca e descoberta de serviços | DISC-TC001, DISC-TC002, DISC-TC003 |
| REQ-RECOM-001 | Sistema de recomendação | RECOM-TC001 |
| REQ-CONTR-001 | Processo de contratação e pagamento | CONTR-TC001 |
| REQ-DASH-001 | Dashboard para clientes | DASH-TC001 |
| REQ-DASH-002 | Dashboard para fornecedores | DASH-TC002 |
| REQ-ADMIN-001 | Painel administrativo | ADMIN-TC001 |
| REQ-ADMIN-002 | Relatórios e analytics | ADMIN-TC002 |
| REQ-ADMIN-003 | Gestão de disputas | ADMIN-TC003 |

## Automação de Testes

### Estrutura do Projeto de Testes
```
/code/automated_tests/
├── scripts/
│   ├── unit/                  # Testes unitários
│   ├── integration/           # Testes de integração
│   ├── e2e/                   # Testes end-to-end
│   └── performance/           # Testes de performance
├── fixtures/                  # Dados de teste
├── reports/                   # Relatórios de execução
├── setup/                     # Scripts de configuração
├── automated_tests_plan.md    # Este documento
└── test_results.md            # Resultados da execução
```

### Configuração do Ambiente

#### Frontend (React)
```bash
# Navegar até a pasta do frontend
cd /code/src/frontend

# Instalar dependências
npm install

# Instalar dependências de desenvolvimento para testes
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw jest-environment-jsdom

# Configurar Jest
cat > jest.config.js << 'EOF'
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
EOF

# Criar arquivo de setup para testes
mkdir -p src/tests
cat > src/tests/setup.js << 'EOF'
import '@testing-library/jest-dom';
EOF

# Adicionar scripts ao package.json
npm pkg set scripts.test="jest"
npm pkg set scripts.test:coverage="jest --coverage"
npm pkg set scripts.test:watch="jest --watch"
```

#### Backend (Node.js/Express)
```bash
# Navegar até a pasta do backend
cd /code/src/backend

# Instalar dependências de desenvolvimento para testes
npm install --save-dev jest supertest @types/jest @types/supertest ts-jest testcontainers

# Configurar Jest
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/config/*.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
EOF

# Adicionar scripts ao package.json
npm pkg set scripts.test="jest"
npm pkg set scripts.test:coverage="jest --coverage"
npm pkg set scripts.test:watch="jest --watch"
npm pkg set scripts.test:integration="jest --config=jest.integration.config.js"
```

#### Cypress (E2E)
```bash
# Navegar até a pasta raiz do projeto
cd /code

# Instalar Cypress
npm install --save-dev cypress cypress-file-upload @testing-library/cypress

# Inicializar Cypress
npx cypress open

# Configurar Cypress
cat > cypress.config.js << 'EOF'
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
  },
});
EOF

# Adicionar scripts ao package.json
cd /code
npm pkg set scripts.cy:open="cypress open"
npm pkg set scripts.cy:run="cypress run"
npm pkg set scripts.test:e2e="start-server-and-test start http://localhost:3000 cy:run"
```

#### k6 (Performance)
```bash
# Navegar até a pasta de testes de performance
cd /code/automated_tests/scripts/performance

# Criar arquivo de teste de performance básico
cat > login_performance.js << 'EOF'
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% das requisições abaixo de 2s
    http_req_failed: ['rate<0.01'],    // Menos de 1% de falhas
  },
};

export default function () {
  const url = 'http://localhost:3001/api/auth/login';
  const payload = JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has token': (r) => JSON.parse(r.body).token !== undefined,
  });

  sleep(1);
}
EOF

# Criar arquivo de teste para busca de serviços
cat > search_performance.js << 'EOF'
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% das requisições abaixo de 2s
    http_req_failed: ['rate<0.01'],    // Menos de 1% de falhas
  },
};

export default function () {
  const url = 'http://localhost:3001/api/services/search?q=consultoria';
  
  const res = http.get(url);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has results': (r) => JSON.parse(r.body).results.length > 0,
  });

  sleep(1);
}
EOF
```

### Exemplos de Scripts de Teste

#### Teste Unitário (React Component)
```javascript
// src/frontend/src/components/auth/LoginForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from '../../store';
import LoginForm from './LoginForm';

const mockLogin = jest.fn();
jest.mock('../../services/authService', () => ({
  login: (credentials) => mockLogin(credentials)
}));

describe('LoginForm Component', () => {
  let store;
  
  beforeEach(() => {
    store = createStore();
    mockLogin.mockReset();
  });
  
  test('renders login form correctly', () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByText(/esqueceu sua senha/i)).toBeInTheDocument();
  });
  
  test('validates required fields', async () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });
    
    expect(mockLogin).not.toHaveBeenCalled();
  });
  
  test('submits form with valid credentials', async () => {
    mockLogin.mockResolvedValueOnce({ token: 'fake-token' });
    
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
  
  test('shows error message on login failure', async () => {
    mockLogin.mockRejectedValueOnce({ message: 'Credenciais inválidas' });
    
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'wrong-password' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
    });
  });
});
```

#### Teste de Integração (Backend API)
```javascript
// src/backend/tests/integration/auth.test.ts
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { hashPassword } from '../../src/services/auth.service';

describe('Auth API', () => {
  beforeAll(async () => {
    // Criar usuário de teste no banco de dados
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: await hashPassword('password123'),
        role: 'CLIENT',
        profile: {
          create: {
            name: 'Test User',
            phone: '1234567890',
          }
        },
        clientProfile: {
          create: {
            companyName: 'Test Company',
            cnpj: '12345678901234',
            segment: 'Technology',
          }
        }
      }
    });
  });
  
  afterAll(async () => {
    // Limpar dados de teste
    await prisma.clientProfile.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });
  
  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
    });
    
    test('should return 401 with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong-password'
        });
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
    
    test('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toContain('Email é obrigatório');
      expect(res.body.errors).toContain('Senha é obrigatória');
    });
  });
  
  describe('POST /api/auth/refresh-token', () => {
    let refreshToken;
    
    beforeAll(async () => {
      // Obter refresh token para testes
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      refreshToken = res.body.refreshToken;
    });
    
    test('should refresh token with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
    });
    
    test('should return 401 with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' });
      
      expect(res.status).toBe(401);
    });
  });
});
```

#### Teste E2E (Cypress)
```javascript
// cypress/e2e/auth/login.cy.js
describe('Login Page', () => {
  beforeEach(() => {
    // Interceptar chamadas de API para mock
    cy.intercept('POST', '/api/auth/login', (req) => {
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
                phone: '1234567890',
              }
            }
          }
        });
      } else {
        req.reply({
          statusCode: 401,
          body: {
            message: 'Credenciais inválidas'
          }
        });
      }
    });
    
    cy.visit('/login');
  });
  
  it('should display login form', () => {
    cy.get('h1').should('contain', 'Login');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Entrar');
    cy.get('a').should('contain', 'Esqueceu sua senha?');
  });
  
  it('should validate required fields', () => {
    cy.get('button[type="submit"]').click();
    cy.get('div.error-message').should('contain', 'Email é obrigatório');
    cy.get('div.error-message').should('contain', 'Senha é obrigatória');
  });
  
  it('should login successfully with valid credentials', () => {
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Verificar redirecionamento para dashboard
    cy.url().should('include', '/dashboard');
    
    // Verificar se token foi armazenado
    cy.window().its('localStorage.token').should('exist');
  });
  
  it('should show error message with invalid credentials', () => {
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('wrong-password');
    cy.get('button[type="submit"]').click();
    
    cy.get('div.error-message').should('contain', 'Credenciais inválidas');
    cy.url().should('include', '/login');
  });
  
  it('should navigate to forgot password page', () => {
    cy.contains('Esqueceu sua senha?').click();
    cy.url().should('include', '/recuperar-senha');
  });
});
```

### Execução dos Testes

#### Localmente
```bash
# Testes unitários frontend
cd /code/src/frontend
npm test

# Testes unitários backend
cd /code/src/backend
npm test

# Testes E2E
cd /code
npm run test:e2e

# Testes de performance
cd /code/automated_tests/scripts/performance
k6 run login_performance.js
```

#### No Pipeline de CI/CD
```yaml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install Dependencies (Frontend)
        working-directory: ./src/frontend
        run: npm ci
      
      - name: Run Frontend Tests
        working-directory: ./src/frontend
        run: npm test -- --coverage
      
      - name: Install Dependencies (Backend)
        working-directory: ./src/backend
        run: npm ci
      
      - name: Run Backend Tests
        working-directory: ./src/backend
        run: npm test -- --coverage
  
  e2e-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Build Frontend
        working-directory: ./src/frontend
        run: npm run build
      
      - name: Start Backend
        working-directory: ./src/backend
        run: npm run start:ci &
      
      - name: Run Cypress Tests
        run: npm run test:e2e
      
      - name: Upload Cypress Videos
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: cypress-videos
          path: cypress/videos
```

## Critérios de Aceite

### Testes Unitários e de Integração
- Cobertura mínima de 80% do código
- Todos os testes devem passar
- Tempo de execução total < 5 minutos
- Testes devem ser independentes (não dependentes de estado)
- Testes devem ser determinísticos (mesmo resultado em execuções diferentes)

### Testes E2E
- Cobertura de 100% dos fluxos críticos de negócio
- Todos os testes devem passar em ambientes de CI
- Tempo de execução < 10 minutos
- Testes resilientes a pequenas mudanças de UI
- Falsos positivos < 5%

### Testes de Performance
- Tempo de resposta < 2s para 95% das requisições
- Taxa de erro < 1%
- Suporte a pelo menos 50 usuários simultâneos sem degradação
- Uso de CPU e memória dentro de limites aceitáveis

## Critérios de Saída
- Todos os testes unitários e de integração passando
- Cobertura de código >= 80%
- Todos os testes E2E dos fluxos críticos passando
- Métricas de performance dentro dos limites estabelecidos
- Todos os bugs críticos e de alta prioridade corrigidos
- Documentação atualizada e completa

## Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Testes instáveis (flaky) | Alto | Média | Implementar retry para testes E2E, melhorar isolamento de testes, usar mocks consistentes |
| Ambiente de teste inconsistente | Alto | Baixa | Usar Docker para garantir ambientes isolados e consistentes |
| Performance dos testes | Médio | Média | Paralelizar execução de testes, otimizar setup/teardown |
| Mudanças frequentes na UI | Alto | Alta | Usar seletores estáveis, abstrair interações comuns, manutenção regular |
| Cobertura insuficiente | Médio | Baixa | Revisão regular da cobertura, testes obrigatórios para novas funcionalidades |

## Anexos
- Documentação das APIs em `/code/docs/api-docs.md`
- Requisitos do sistema em `/assets/documentos/requisitos_produto.md`
- Arquitetura do sistema em `/assets/documentos/arquitetura_sistema.md`
- Backlog de desenvolvimento em `/assets/documentos/backlog_desenvolvimento.md`

## Histórico de Revisões
| Versão | Data | Autor | Descrição das Alterações |
|--------|------|-------|--------------------------|
| 1.0 | 2025-05-27 | QA Team | Versão inicial do plano de testes |