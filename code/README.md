# Marketplace de Benefícios para Clientes PJ

Este projeto implementa um marketplace que permite a pequenas e médias empresas, clientes de um banco, contratar serviços como contabilidade, recursos humanos, marketing, consultorias financeiras e jurídicas.

## Estrutura do Projeto

```
marketplace/
├── src/
│   ├── frontend/            # Aplicação React (TypeScript)
│   └── backend/             # API e serviços Node.js (TypeScript)
│       ├── prisma/          # Esquema do banco de dados e migrações
│       └── src/             # Código fonte do backend
├── deploy/                  # Configurações de deploy e infraestrutura
│   ├── nginx/               # Configuração do servidor web/proxy reverso
│   └── prometheus/          # Configuração de monitoramento
├── automated_tests/         # Testes automatizados
├── docker-compose.yml       # Composição de containers Docker
└── setup.sh                 # Script de inicialização do ambiente
```

## Stack Tecnológica

- **Frontend**: React.js, TypeScript, Material-UI, Redux
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Banco de Dados**: PostgreSQL
- **Cache**: Redis
- **Infraestrutura**: Docker, Docker Compose, Nginx
- **Monitoramento**: Prometheus, Grafana
- **Testes**: Jest, React Testing Library, Cypress, k6

## Pré-requisitos

- Docker
- Docker Compose
- Node.js v18+ (para desenvolvimento local)

## Execução da Aplicação

### Configuração Inicial

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd marketplace
```

2. Conceda permissão de execução ao script de setup:
```bash
chmod +x setup.sh
```

3. Execute o script de setup:
```bash
./setup.sh
```

Este script irá:
- Construir e iniciar os containers Docker
- Executar as migrações do banco de dados
- Carregar dados iniciais (seed)

### Verificação da Execução

Após a inicialização, verifique se todos os serviços estão funcionando:

1. **Frontend**: Acesse http://localhost:3000 no navegador
2. **API Backend**: Verifique o status com `curl http://localhost:3001/api/health`
3. **Monitoramento**: Acesse o Grafana em http://localhost:3005 (login: admin/admin)

### Acesso aos Serviços

- Frontend: http://localhost:3000
- API Backend: http://localhost:3001
- Serviço de Autenticação: http://localhost:3002
- Mock de APIs Bancárias: http://localhost:3003
- Grafana Dashboard: http://localhost:3005 (admin/admin)

### Monitoramento Durante a Execução

Para acompanhar os logs durante a inicialização:
```bash
docker-compose logs -f
```

Para verificar logs de um serviço específico:
```bash
docker-compose logs -f [serviço]  # Ex: docker-compose logs -f backend
```

## Funcionalidades Implementadas

O MVP do Marketplace de Benefícios para Clientes PJ inclui as seguintes funcionalidades:

1. **Sistema de Autenticação e Controle de Acesso**
   - Login, registro e recuperação de senha
   - Perfis diferenciados (Cliente PJ, Fornecedor, Administrador)

2. **Cadastro e Aprovação de Fornecedores**
   - Formulário completo para fornecedores
   - Fluxo de aprovação por administradores

3. **Catálogo de Serviços**
   - Cadastro de serviços por fornecedores
   - Aprovação de serviços por administradores
   - Busca avançada e navegação por categorias

4. **Sistema de Recomendação**
   - Recomendações baseadas no perfil da empresa
   - Recomendações por histórico de visualização

5. **Contratação e Pagamento**
   - Fluxo completo de contratação
   - Simulação de pagamento
   - Geração e gestão de contratos

6. **Dashboards**
   - Dashboard para clientes PJ
   - Dashboard para fornecedores
   - Painel administrativo

7. **Relatórios e Analytics**
   - Sistema de relatórios customizáveis
   - Analytics para tomada de decisão

8. **Gestão de Disputas**
   - Sistema de abertura e resolução de disputas
   - Mediação por administradores

## Testes Automatizados

O projeto inclui testes automatizados abrangentes:

1. **Testes Unitários**: Validam componentes isolados
   ```bash
   docker-compose exec frontend npm test
   docker-compose exec backend npm test
   ```

2. **Testes de Integração**: Verificam a comunicação entre componentes
   ```bash
   docker-compose exec backend npm run test:integration
   ```

3. **Testes E2E**: Validam fluxos completos de usuário
   ```bash
   npm run test:e2e
   ```

4. **Testes de Performance**: Avaliam o desempenho do sistema
   ```bash
   cd automated_tests/scripts/performance
   k6 run api_performance.js
   ```

## Comandos Úteis

### Docker Compose

- Iniciar todos os serviços: `docker-compose up -d`
- Parar todos os serviços: `docker-compose down`
- Ver logs: `docker-compose logs -f [serviço]`
- Reconstruir serviços: `docker-compose build [serviço]`

### Backend

- Acessar o shell do container: `docker-compose exec backend sh`
- Executar migrações: `docker-compose exec backend npm run migrate:dev`
- Executar testes: `docker-compose exec backend npm test`
- Gerar schema Prisma: `docker-compose exec backend npm run generate`
- Resetar banco de dados: `docker-compose exec backend npm run db:reset`

### Frontend

- Acessar o shell do container: `docker-compose exec frontend sh`
- Executar testes: `docker-compose exec frontend npm test`
- Verificar cobertura: `docker-compose exec frontend npm run test:coverage`

## Solução de Problemas

### Problemas Comuns

1. **Serviços não iniciam**:
   - Verifique se as portas 3000-3005, 5432, 6379 estão disponíveis
   - Verifique logs com `docker-compose logs`

2. **Erro de conexão com banco de dados**:
   - Aguarde a inicialização completa do PostgreSQL
   - Verifique as variáveis de ambiente em docker-compose.yml

3. **Frontend não carrega**:
   - Verifique se o backend está funcionando
   - Limpe o cache do navegador

### Reiniciar do Zero

Se precisar reiniciar toda a aplicação do zero:

```bash
docker-compose down -v  # Remove containers e volumes
docker-compose build --no-cache  # Reconstrói sem usar cache
./setup.sh  # Reinicia o setup completo
```

## Variáveis de Ambiente

### Backend

- `NODE_ENV`: Ambiente de execução (development, test, production)
- `PORT`: Porta em que o servidor será executado
- `DATABASE_URL`: URL de conexão com o banco de dados PostgreSQL
- `REDIS_URL`: URL de conexão com o Redis
- `JWT_SECRET`: Chave secreta para assinatura de tokens JWT
- `JWT_EXPIRES_IN`: Tempo de expiração de tokens JWT
- `REFRESH_TOKEN_EXPIRES_IN`: Tempo de expiração de refresh tokens

### Frontend

- `VITE_API_URL`: URL da API backend
- `VITE_AUTH_URL`: URL do serviço de autenticação

## Próximas Etapas de Desenvolvimento

1. **Integração Real com Sistemas Bancários**
2. **Implementação de Chat em Tempo Real**
3. **Sistema Avançado de Análise Preditiva**
4. **App Mobile Nativo**
5. **Marketplace de Integrações com Ferramentas Externas**

## Estrutura de Branches

- `main`: Código em produção
- `develop`: Código de desenvolvimento estável
- `feature/*`: Novas funcionalidades
- `bugfix/*`: Correções de bugs
- `release/*`: Preparação para lançamento

## Contribuição

1. Crie um branch a partir de `develop`
2. Faça suas alterações
3. Abra um Pull Request para `develop`
4. Após revisão, seu código será mesclado

## Licença

Este projeto é propriedade do banco e seu uso é restrito.