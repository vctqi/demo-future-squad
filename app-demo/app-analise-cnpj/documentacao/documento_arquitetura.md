# Documento de Arquitetura Técnica: Analisador de Risco de Cliente PJ via CNPJ

## 1. Introdução

### 1.1 Propósito
Este documento descreve a arquitetura técnica do sistema "Analisador de Risco de Cliente PJ via CNPJ", detalhando as escolhas tecnológicas, componentes do sistema, modelo de dados e infraestrutura necessária para implementação.

### 1.2 Escopo
A arquitetura descrita neste documento abrange:
- Tecnologias e frameworks a serem utilizados
- Estrutura de componentes e suas interações
- Integração com a API pública de CNPJ
- Modelo de dados
- Estratégia de logging e monitoramento
- Diagramas arquiteturais

### 1.3 Referências
- Documento de Requisitos (documentacao/documento_requisitos.md)
- API pública de CNPJ (https://docs.cnpj.ws/referencia-de-api/api-publica)

## 2. Visão Geral da Arquitetura

O sistema será construído seguindo uma arquitetura cliente-servidor em três camadas:
1. **Camada de Apresentação (Frontend)**: Interface com o usuário, responsável pela entrada de dados e visualização dos resultados.
2. **Camada de Aplicação (Backend)**: Lógica de negócio, processamento de dados e comunicação com APIs externas.
3. **Camada de Dados**: Armazenamento persistente das consultas e resultados.

### 2.1 Diagrama de Arquitetura (C4 Model - Nível de Contexto)

```mermaid
graph LR
    Usuario["Usuário (Analista de Crédito)"] --> Analisador["Analisador de Risco de Cliente PJ"]
    Analisador --> Usuario
    Analisador --> APICNPJ["API Pública de CNPJ (https://docs.cnpj.ws)"]
```

### 2.2 Diagrama de Arquitetura (C4 Model - Nível de Contêineres)

```mermaid
graph TD
    subgraph Analisador de Risco de Cliente PJ
        Frontend["Frontend (HTML5 + JS/React)"]
        Backend["Backend (NodeJS)"]
        BancoDados["Banco de Dados (SQLite)"]
        Frontend <--> Backend
        Backend <--> BancoDados
    end
    Backend --> APICNPJ["API Pública de CNPJ"]
```

### 2.3 Diagrama de Arquitetura (C4 Model - Nível de Componentes)

```mermaid
graph TD
    subgraph Frontend ["Frontend (HTML5 + JS/React)"]
        FormCNPJ["Formulário de Consulta CNPJ"]
        CompLoading["Componente de Loading"]
        DashResultados["Dashboard de Resultados"]
    end

    subgraph Backend ["Backend (NodeJS)"]
        CtrlCNPJ["Controlador de CNPJ"]
        SvcAnalise["Serviço de Análise Risco"]
        ModScore["Módulo de Score"]
        SvcCache["Serviço de Cache"]
        AdaptAPI["Adaptador de API CNPJ"]
        RepoConsultas["Repositório de Consultas"]

        CtrlCNPJ --> SvcAnalise
        SvcAnalise --> ModScore
        
        AdaptAPI --> SvcCache
        SvcCache --> RepoConsultas

        CtrlCNPJ --> SvcCache
        CtrlCNPJ --> AdaptAPI
    end

    FormCNPJ --> CtrlCNPJ
    DashResultados --> CtrlCNPJ

    AdaptAPI --> APIExterna["API Externa de CNPJ"]
    RepoConsultas --> BD["Banco de Dados (SQLite)"]
```

### 2.4 Diagrama de Fluxo de Dados

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant C as Backend.Controlador
    participant SC as Backend.ServicoCache
    participant AA as Backend.AdaptadorAPICNPJ
    participant SA as Backend.ServicoAnaliseRisco
    participant ExtAPI as API CNPJ Externa
    participant DB as Banco de Dados

    U->>F: 1. Insere CNPJ
    F->>C: 2. Envia CNPJ
    C->>SC: 3. Verifica Cache
    alt Cache Hit
        SC-->>C: 4. Dados do Cache
        C->>SA: Processar com dados do cache
    else Cache Miss
        SC-->>C: 5. Cache Não Encontrado
        C->>AA: Consultar API Externa
        AA->>ExtAPI: 6. Consulta API
        ExtAPI-->>AA: Dados da Empresa
        AA-->>C: Dados da Empresa
        C->>SA: Processar com dados da API
    end
    SA->>SA: 7. Calcula Score e Análise
    C-->>F: Resultado da Análise
    F-->>U: 8. Exibe Resultado
    SA->>DB: 9. Salva Resultado e Análise
```

## 3. Escolha de Tecnologias

### 3.1 Frontend
- **HTML5 + JavaScript**: Para estruturação e funcionalidades básicas da interface
- **React**: Framework para construção da interface de usuário, escolhido pela facilidade de criar componentes reutilizáveis, gerenciamento eficiente do DOM e amplo ecossistema
- **Axios**: Biblioteca para realizar requisições HTTP ao backend
- **Bootstrap ou Material-UI**: Para estilização e componentes visuais prontos

**Justificativa**: React foi escolhido por sua facilidade em criar interfaces interativas e reativas, ideal para o dashboard de risco. O uso de componentes facilita a manutenção e extensão do código. As bibliotecas de UI permitem um desenvolvimento mais rápido com componentes pré-estilizados.

### 3.2 Backend
- **Node.js**: Plataforma de execução JavaScript do lado do servidor
- **Express.js**: Framework para construção de APIs RESTful
- **Axios**: Para realizar chamadas à API externa de CNPJ
- **Joi**: Para validação de dados de entrada
- **Winston**: Para implementação de logs

**Justificativa**: Node.js combinado com Express.js permite um desenvolvimento rápido e eficiente de APIs RESTful, com excelente performance para operações I/O como chamadas a APIs externas. A mesma linguagem no frontend e backend (JavaScript) também simplifica o desenvolvimento.

### 3.3 Banco de Dados
- **SQLite**: Banco de dados relacional leve, conforme sugerido nos requisitos

**Justificativa**: SQLite é um banco de dados leve que não requer instalação de servidor separado, ideal para aplicações com volume moderado de dados e necessidade de configuração simples. Como os dados armazenados são apenas históricos de consultas, não há necessidade de um SGBD mais robusto neste momento.

### 3.4 Ferramentas de Desenvolvimento
- **Git**: Para controle de versão
- **npm**: Para gerenciamento de dependências
- **Postman/Insomnia**: Para testar chamadas à API
- **Jest**: Para testes unitários
- **ESLint**: Para garantir qualidade e padronização do código

## 4. Componentes do Sistema

### 4.1 Frontend

#### 4.1.1 Formulário de Consulta CNPJ
- **Responsabilidades**: 
  - Capturar o CNPJ inserido pelo usuário
  - Validar o formato do CNPJ
  - Enviar a requisição para o backend
  - Exibir indicador de carregamento durante a consulta
- **Interfaces**:
  - Entrada: Campo de texto para CNPJ
  - Saída: Requisição HTTP para o backend

#### 4.1.2 Dashboard de Resultados
- **Responsabilidades**:
  - Exibir dados cadastrais da empresa
  - Mostrar classificação de risco com badge visual
  - Listar sinais de alerta identificados
  - Detalhar critérios que impactaram o score
- **Interfaces**:
  - Entrada: Dados da resposta do backend
  - Saída: Visualização formatada para o usuário

### 4.2 Backend

#### 4.2.1 Controlador de CNPJ
- **Responsabilidades**:
  - Receber requisições do frontend
  - Validar o CNPJ recebido
  - Orquestrar o fluxo de processamento
  - Retornar a resposta ao frontend
- **Interfaces**:
  - Entrada: Requisição HTTP do frontend
  - Saída: Resposta HTTP para o frontend

#### 4.2.2 Serviço de Cache
- **Responsabilidades**:
  - Verificar se o CNPJ já foi consultado nas últimas 24 horas
  - Recuperar dados de consultas recentes do banco
- **Interfaces**:
  - Entrada: CNPJ a ser verificado
  - Saída: Dados da consulta anterior ou indicação de que não há cache

#### 4.2.3 Adaptador de API CNPJ
- **Responsabilidades**:
  - Encapsular a comunicação com a API externa de CNPJ
  - Formatar requisições para a API
  - Tratar respostas e erros da API
  - Transformar dados recebidos para o formato interno da aplicação
- **Interfaces**:
  - Entrada: CNPJ a ser consultado
  - Saída: Dados formatados da empresa ou erro tratado

#### 4.2.4 Serviço de Análise de Risco
- **Responsabilidades**:
  - Aplicar os critérios de score aos dados da empresa
  - Calcular a pontuação total
  - Classificar o risco (Baixo, Médio, Alto)
  - Identificar sinais de alerta
- **Interfaces**:
  - Entrada: Dados da empresa
  - Saída: Análise de risco completa com pontuação e classificação

#### 4.2.5 Repositório de Consultas
- **Responsabilidades**:
  - Persistir histórico de consultas no banco de dados
  - Recuperar consultas anteriores
- **Interfaces**:
  - Entrada: Dados da consulta a serem salvos
  - Saída: Confirmação de salvamento ou dados recuperados

## 5. Integração com API de CNPJ

### 5.1 Detalhes da API
A API pública de CNPJ (https://docs.cnpj.ws/referencia-de-api/api-publica) será utilizada para obter dados cadastrais das empresas. Esta API permite a consulta de informações como situação cadastral, data de abertura, CNAE, porte da empresa e localização.

### 5.2 Formato de Requisição
- **Endpoint**: `https://publica.cnpj.ws/cnpj/{cnpj}`
- **Método HTTP**: GET
- **Parâmetros de URL**: CNPJ (somente números)
- **Headers**: Não requer autenticação para a API pública

### 5.3 Exemplo de Chamada
```bash
curl -X GET "https://publica.cnpj.ws/cnpj/00000000000191"
```

### 5.4 Formato de Resposta
A API retorna dados em formato JSON. Um exemplo simplificado:

```json
{
  "razao_social": "BANCO DO BRASIL SA",
  "estabelecimento": {
    "situacao_cadastral": "ATIVA",
    "data_inicio_atividade": "1966-08-01",
    "cnae_fiscal_principal": {
      "codigo": "6422100",
      "descricao": "Bancos múltiplos, com carteira comercial"
    }
  },
  "porte": {
    "codigo": "05",
    "descricao": "DEMAIS"
  },
  "endereco": {
    "municipio": {
      "nome": "BRASILIA"
    },
    "uf": {
      "sigla": "DF"
    }
  }
}
```

### 5.5 Tratamento de Erros
O adaptador de API deve tratar adequadamente os seguintes cenários:
- CNPJ não encontrado (404)
- Erros de servidor (5xx)
- Timeout de conexão
- Formato de resposta inesperado

### 5.6 Estratégia de Implementação
1. Criar um módulo adaptador específico para a API de CNPJ
2. Realizar chamadas de teste à API antes de implementar a lógica de tratamento
3. Encapsular a lógica de chamada e tratamento de respostas
4. Implementar cache para reduzir chamadas à API
5. Adicionar logs detalhados para monitoramento das chamadas

## 6. Modelo de Dados

### 6.1 Modelo Conceitual

#### 6.1.1 Entidade: Consulta
- **CNPJ**: Número do CNPJ consultado
- **DataConsulta**: Data e hora da consulta
- **DadosEmpresa**: Dados obtidos da API
- **ScoreRisco**: Pontuação calculada
- **ClassificacaoRisco**: Classificação (Baixo, Médio, Alto)
- **CriteriosAplicados**: Lista de critérios aplicados e pontuações

### 6.2 Modelo de Banco de Dados

#### 6.2.1 Tabela: consultas
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `cnpj`: TEXT NOT NULL
- `data_consulta`: DATETIME NOT NULL
- `razao_social`: TEXT
- `situacao_cadastral`: TEXT
- `data_abertura`: DATE
- `cnae_principal`: TEXT
- `descricao_cnae`: TEXT
- `porte_empresa`: TEXT
- `municipio`: TEXT
- `uf`: TEXT
- `score`: INTEGER NOT NULL
- `classificacao_risco`: TEXT NOT NULL
- `dados_completos`: TEXT (JSON com todos os dados)

#### 6.2.2 Tabela: criterios_aplicados
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `consulta_id`: INTEGER NOT NULL
- `criterio`: TEXT NOT NULL
- `pontuacao`: INTEGER NOT NULL
- `FOREIGN KEY (consulta_id)`: REFERENCES consultas(id)

### 6.3 Diagrama do Modelo de Dados

```mermaid
erDiagram
    consultas {
        INTEGER id PK
        TEXT cnpj
        DATETIME data_consulta
        TEXT razao_social
        TEXT situacao_cadastral
        DATE data_abertura
        TEXT cnae_principal
        TEXT descricao_cnae
        TEXT porte_empresa
        TEXT municipio
        TEXT uf
        INTEGER score
        TEXT classificacao_risco
        TEXT dados_completos
    }
    criterios_aplicados {
        INTEGER id PK
        INTEGER consulta_id FK
        TEXT criterio
        INTEGER pontuacao
    }
    consultas ||--o{ criterios_aplicados : "possui"
```

## 7. Estratégia de Logging

### 7.1 Níveis de Log
- **ERROR**: Erros que impedem o funcionamento correto da aplicação
- **WARN**: Situações anômalas que não impedem o funcionamento, mas merecem atenção
- **INFO**: Eventos normais e significativos do sistema
- **DEBUG**: Informações detalhadas úteis para debugging

### 7.2 Eventos a Serem Logados
- **Início e fim da aplicação**:
  - INFO: "Aplicação iniciada na porta {porta}"
  - INFO: "Aplicação encerrada"

- **Chamadas à API de CNPJ**:
  - INFO: "Iniciando consulta do CNPJ: {cnpj}"
  - INFO: "Resposta recebida para CNPJ: {cnpj}, status: {statusCode}"
  - ERROR: "Erro na consulta do CNPJ: {cnpj}, erro: {mensagemErro}"

- **Cache**:
  - INFO: "Consultando cache para CNPJ: {cnpj}"
  - INFO: "Cache encontrado para CNPJ: {cnpj}, data da consulta original: {dataConsulta}"
  - DEBUG: "Cache não encontrado para CNPJ: {cnpj}"

- **Cálculo de Score**:
  - DEBUG: "Iniciando cálculo de score para CNPJ: {cnpj}"
  - DEBUG: "Critério aplicado: {criterio}, pontuação: {pontuacao}"
  - INFO: "Score final para CNPJ: {cnpj}: {score}, classificação: {classificacao}"

- **Erros Críticos**:
  - ERROR: "Erro na validação do CNPJ: {cnpj}, erro: {mensagemErro}"
  - ERROR: "Erro na conexão com o banco de dados: {mensagemErro}"
  - ERROR: "Exceção não tratada: {mensagemErro}"

### 7.3 Formato do Log
Formato sugerido: `YYYY-MM-DD HH:MM:SS [NÍVEL] - Mensagem`

Exemplo:
```
2025-06-06 10:15:30 [INFO] - Aplicação iniciada na porta 3000
2025-06-06 10:15:45 [INFO] - Iniciando consulta do CNPJ: 00.000.000/0001-91
2025-06-06 10:15:46 [INFO] - Resposta recebida para CNPJ: 00.000.000/0001-91, status: 200
2025-06-06 10:15:47 [INFO] - Score final para CNPJ: 00.000.000/0001-91: 30, classificação: Baixo Risco
```

### 7.4 Destino dos Logs
- Saída padrão (console) em ambiente de desenvolvimento
- Arquivo de log `logs/application.log` em produção
- Rotação de logs para evitar arquivos muito grandes

## 8. Considerações de Segurança

### 8.1 Validação de Entrada
- Validar o formato e os dígitos verificadores do CNPJ antes de processar
- Escapar dados de entrada para prevenir injeção de SQL
- Usar parâmetros parametrizados em consultas SQL

### 8.2 Proteção contra Ataques
- Implementar rate limiting para prevenir abusos da API
- Validar e sanitizar todos os dados de entrada
- Implementar proteção básica contra ataques XSS

### 8.3 Segurança dos Dados
- Não armazenar dados sensíveis além do necessário
- Implementar controle de acesso básico ao histórico de consultas
- Garantir que o banco de dados SQLite esteja em um diretório protegido

## 9. Infraestrutura

Para este projeto, a infraestrutura necessária é simples e leve:

### 9.1 Ambiente de Desenvolvimento
- Qualquer máquina com Node.js instalado (versão >=14.x)
- SQLite para banco de dados local
- Git para controle de versão

### 9.2 Ambiente de Produção
- Servidor com Node.js instalado
- Servidor web (opcional, pode-se usar o próprio Node.js)
- SQLite para banco de dados
- Idealmente, um servidor de logs (opcional)

### 9.3 Requisitos de Hardware
- Mínimo: 1 vCPU, 1GB RAM, 10GB de armazenamento
- Recomendado: 2 vCPU, 2GB RAM, 20GB de armazenamento

## 10. Decisões Arquiteturais

### 10.1 Escolha de SQLite
- **Decisão**: Utilizar SQLite como banco de dados
- **Alternativas Consideradas**: MySQL, PostgreSQL
- **Justificativa**: SQLite é leve, não requer instalação de servidor separado e é suficiente para o volume de dados esperado nesta aplicação

### 10.2 Padrão de Arquitetura MVC
- **Decisão**: Adotar o padrão Model-View-Controller
- **Alternativas Consideradas**: Arquitetura Hexagonal, Clean Architecture
- **Justificativa**: MVC é simples de implementar e compreender, adequado para aplicações web de tamanho pequeno a médio

### 10.3 Estratégia de Cache
- **Decisão**: Implementar cache no banco de dados SQLite
- **Alternativas Consideradas**: Redis, Memcached, cache em memória
- **Justificativa**: Simplificação da infraestrutura, evitando dependências adicionais

## 11. Riscos e Mitigações

### 11.1 Indisponibilidade da API de CNPJ
- **Risco**: A API externa de CNPJ pode ficar indisponível
- **Mitigação**: Implementar cache de consultas e degradação graceful da aplicação

### 11.2 Performance com Aumento de Dados
- **Risco**: SQLite pode ter limitações de performance com crescimento do volume de dados
- **Mitigação**: Implementar limpeza periódica de dados antigos ou planejar migração para um SGBD mais robusto se necessário

### 11.3 Limites de Uso da API
- **Risco**: A API pública pode ter limites de requisições
- **Mitigação**: Maximizar o uso do cache e implementar backoff exponencial em caso de erros por limite excedido

## 12. Conclusão

A arquitetura proposta para o "Analisador de Risco de Cliente PJ via CNPJ" foi projetada para ser funcional, eficiente e de fácil implementação. Utilizando tecnologias modernas como React e Node.js, e adotando uma abordagem de camadas bem definidas, o sistema será capaz de atender a todos os requisitos funcionais e não funcionais especificados, com espaço para evolução futura.

Os componentes foram desenhados para serem modulares e com responsabilidades bem definidas, facilitando a manutenção e extensão do código. A estratégia de integração com a API externa de CNPJ foi detalhada para garantir robustez e tratamento adequado de cenários de erro. O modelo de dados foi projetado para armazenar eficientemente o histórico de consultas, e a estratégia de logging foi definida para facilitar o monitoramento e diagnóstico do sistema.
