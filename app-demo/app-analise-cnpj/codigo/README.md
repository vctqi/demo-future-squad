# Analisador de Risco de Cliente PJ via CNPJ

## Descrição

O Analisador de Risco de Cliente PJ via CNPJ é uma ferramenta que permite aos usuários inserir o CNPJ de um cliente pessoa jurídica e receber uma análise simplificada de risco, baseada em dados públicos e critérios pré-definidos. A ferramenta consulta dados cadastrais via API pública, calcula um score de risco com base em critérios específicos e apresenta os resultados em um dashboard intuitivo.

## Funcionalidades

- Consulta de dados de empresas por CNPJ via API pública
- Cálculo de score de risco baseado em critérios pré-definidos
- Visualização detalhada de dados cadastrais e classificação de risco
- Armazenamento de histórico de consultas
- Cache para consultas recentes (últimas 24 horas)

## Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- SQLite
- Axios (para requisições HTTP)
- Winston (para logging)

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5
- jQuery
- jQuery Mask Plugin

## Requisitos do Sistema

- Node.js (versão 14.x ou superior)
- npm (versão 6.x ou superior)
- Sistema operacional: Windows, macOS ou Linux

## Configuração do Ambiente

### Instalação Manual

1. Certifique-se de ter o Node.js e npm instalados:

```bash
node --version
npm --version
```

Se não estiverem instalados, você pode baixá-los em [nodejs.org](https://nodejs.org/).

2. Clone o repositório (se ainda não o fez):

```bash
git clone [URL_DO_REPOSITORIO]
cd analisador-risco-cnpj
```

3. Instale as dependências do backend:

```bash
cd backend
npm install
```

### Instalação Automática (usando script)

O script `start.sh` verifica automaticamente se Node.js e npm estão instalados e, se não estiverem, tenta instalá-los (requer privilégios de administrador).

## Estrutura de Diretórios

```
analisador-risco-cnpj/
├── backend/                 # Código do backend
│   ├── controllers/         # Controladores da aplicação
│   ├── database/            # Configuração e operações do banco de dados
│   ├── routes/              # Definição de rotas da API
│   ├── services/            # Serviços de negócio
│   ├── utils/               # Utilitários
│   ├── package.json         # Dependências do backend
│   └── server.js            # Ponto de entrada do servidor
├── frontend/                # Código do frontend
│   └── public/              # Arquivos estáticos
│       ├── css/             # Estilos CSS
│       ├── images/          # Imagens (logos, etc.)
│       ├── js/              # Scripts JavaScript
│       └── index.html       # Página principal
├── logs/                    # Logs da aplicação
├── start.sh                 # Script para iniciar a aplicação
├── stop.sh                  # Script para parar a aplicação
└── README.md                # Este arquivo
```

## Executando a Aplicação

### Usando os Scripts de Automação

1. Torne os scripts executáveis (se necessário):

```bash
chmod +x start.sh stop.sh
```

2. Inicie a aplicação:

```bash
./start.sh
```

O script verificará os requisitos necessários, instalará as dependências e iniciará o servidor.

3. Acesse a aplicação em seu navegador:

```
http://localhost:3000
```

4. Para parar a aplicação:

```bash
./stop.sh
```

### Executando Manualmente

1. Inicie o servidor backend:

```bash
cd backend
node server.js
```

2. Acesse a aplicação em seu navegador:

```
http://localhost:3000
```

## Usando a Aplicação

1. Na página inicial, insira um CNPJ válido no campo fornecido.
   - O campo aceita o formato XX.XXX.XXX/XXXX-XX ou apenas os números
   - Exemplos de CNPJs válidos para teste:
     - 00.000.000/0001-91 (Banco do Brasil)
     - 33.000.167/0001-01 (Petrobras)

2. Clique no botão "Analisar Risco" ou pressione Enter.

3. O sistema consultará a API de CNPJ, calculará o score de risco e exibirá os resultados:
   - Dados cadastrais da empresa
   - Classificação de risco (Baixo, Médio ou Alto)
   - Critérios aplicados no cálculo do score
   - Sinais de alerta identificados

4. Se o CNPJ já foi consultado nas últimas 24 horas, o sistema usará os dados em cache e exibirá uma notificação.
   - Você pode forçar uma nova consulta clicando no botão "Atualizar dados"

5. Para realizar uma nova consulta, clique no botão "Nova Consulta".

## Banco de Dados

A aplicação utiliza SQLite para armazenamento, com dois principais modelos:

1. **consultas**: Armazena os resultados das consultas realizadas
2. **criterios_aplicados**: Armazena os critérios aplicados em cada consulta

O banco de dados é criado automaticamente na primeira execução da aplicação.

## Logs

Os logs da aplicação são armazenados em:

- Console (durante a execução)
- Arquivo `logs/application.log`
- Arquivo `logs/server.log` (quando iniciado pelo script `start.sh`)

Os logs incluem:
- Início e parada da aplicação
- Consultas à API de CNPJ
- Verificações de cache
- Cálculos de score
- Erros e exceções

## Solução de Problemas

### A aplicação não inicia

1. Verifique se os requisitos estão instalados:

```bash
node --version
npm --version
```

2. Verifique se as dependências foram instaladas:

```bash
cd backend
npm install
```

3. Verifique os logs para identificar erros:

```bash
cat ../logs/server.log
```

### Erros ao consultar CNPJ

1. Verifique se o CNPJ inserido é válido
2. Verifique se há conexão com a internet
3. A API de CNPJ pode estar com limite de requisições excedido (retry após alguns minutos)
4. Verifique os logs para identificar erros específicos:

```bash
cat ../logs/application.log
```

## Segurança

- A aplicação valida o CNPJ no frontend e no backend
- Tratamento de exceções e entradas inválidas
- Logs para auditoria e diagnóstico

## Limitações Conhecidas

- A API de CNPJ pública pode ter limitações de requisições
- Apenas CNPJs brasileiros são suportados
- Os critérios de risco são simplificados e para fins de demonstração

## Suporte

Para suporte técnico ou dúvidas, entre em contato com o desenvolvedor.