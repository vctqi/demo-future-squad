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

## Pré-requisitos

- Docker
- Docker Compose
- Node.js v18+ (para desenvolvimento local)

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd marketplace
```

2. Execute o script de setup:
```bash
./setup.sh
```

Este script irá:
- Construir e iniciar os containers Docker
- Executar as migrações do banco de dados
- Carregar dados iniciais

3. Acesse a aplicação:
- Frontend: http://localhost:3000
- API Backend: http://localhost:3001
- Serviço de Autenticação: http://localhost:3002
- Mock de APIs Bancárias: http://localhost:3003
- Grafana Dashboard: http://localhost:3005 (admin/admin)

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

### Frontend

- Acessar o shell do container: `docker-compose exec frontend sh`
- Executar testes: `docker-compose exec frontend npm test`

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