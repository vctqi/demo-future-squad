# Documento de Requisitos: Analisador de Risco de Cliente PJ via CNPJ

## 1. Visão Geral do Sistema

### 1.1 Propósito
O "Analisador de Risco de Cliente PJ via CNPJ" é uma ferramenta que permite aos usuários inserir o CNPJ de um cliente pessoa jurídica e receber uma análise simplificada de risco, baseada em dados públicos e critérios pré-definidos. A ferramenta visa auxiliar na tomada de decisão para concessão de crédito, estabelecimento de parcerias comerciais ou avaliação de clientes.

### 1.2 Público-Alvo
- Analistas de crédito
- Gestores comerciais
- Departamentos de compliance
- Profissionais de vendas B2B

### 1.3 Escopo
O sistema abrange:
- Consulta de dados cadastrais de empresas via CNPJ
- Análise de risco baseada em critérios pré-definidos
- Exibição de resultados em formato de dashboard
- Armazenamento de histórico de consultas

O sistema não inclui:
- Análise financeira detalhada
- Consulta a bureaus de crédito privados
- Integração com sistemas externos além da API pública de CNPJ

## 2. Requisitos Funcionais

### RF-01: Consulta de CNPJ
**Descrição:** O sistema deve permitir ao usuário inserir um CNPJ para análise.
**Detalhamento:**
- Deve validar o formato do CNPJ (14 dígitos)
- Deve aplicar máscara de formatação (XX.XXX.XXX/YYYY-ZZ)
- Deve verificar a validade do CNPJ pelo algoritmo de dígitos verificadores

### RF-02: Consulta à API de CNPJ
**Descrição:** O sistema deve consultar dados públicos da empresa via API.
**Detalhamento:**
- Deve realizar chamadas à API pública (https://docs.cnpj.ws/)
- Deve obter os seguintes dados:
  - Situação cadastral (ativa, inapta, suspensa, baixada)
  - Data de abertura
  - CNAE principal (atividade econômica)
  - Porte da empresa
  - Localização (endereço, município, UF)
- Deve tratar erros de comunicação com a API
- Deve informar ao usuário em caso de indisponibilidade da API

### RF-03: Cálculo de Score de Risco
**Descrição:** O sistema deve calcular um score de risco com base nos dados obtidos.
**Detalhamento:**
- Deve aplicar os seguintes critérios e pontuações:
  - Empresa ativa: +10 pontos
  - Mais de 3 anos de operação: +10 pontos
  - CNAE de baixo risco: +10 pontos
  - CNAE de risco (ex.: factoring): -10 pontos
  - Empresa inativa/suspensa: -20 pontos
  - Empresa aberta há menos de 6 meses: -10 pontos
- Deve classificar o risco final como:
  - Baixo risco: 20 pontos ou mais
  - Médio risco: Entre 0 e 19 pontos
  - Alto risco: Abaixo de 0 pontos

### RF-04: Exibição de Resultados
**Descrição:** O sistema deve exibir os resultados da análise em um dashboard simplificado.
**Detalhamento:**
- Deve mostrar os dados cadastrais básicos do CNPJ consultado
- Deve exibir a classificação de risco (Baixo, Médio, Alto)
- Deve apresentar os sinais de alerta identificados:
  - Situação cadastral irregular
  - Empresa recém-aberta
  - CNAE com risco associado
- Deve mostrar um badge visual indicando o nível de risco:
  - Verde para baixo risco
  - Amarelo para médio risco
  - Vermelho para alto risco
- Deve exibir os critérios que impactaram o score, com suas respectivas pontuações

### RF-05: Armazenamento de Consultas
**Descrição:** O sistema deve salvar o resultado das consultas no banco de dados.
**Detalhamento:**
- Deve armazenar os seguintes dados para cada consulta:
  - CNPJ consultado
  - Data e hora da consulta
  - Dados obtidos da API
  - Score calculado e classificação de risco
  - Critérios aplicados e pontuações
- Deve manter um histórico de todas as consultas realizadas

### RF-06: Cache de Consultas Recentes
**Descrição:** O sistema deve utilizar dados em cache para consultas recentes do mesmo CNPJ.
**Detalhamento:**
- Se um CNPJ for consultado novamente em menos de 24 horas, deve:
  - Recuperar os dados da consulta anterior do banco de dados
  - Não realizar nova chamada à API
  - Informar ao usuário que os dados apresentados são de uma consulta anterior
  - Mostrar a data e hora da consulta original

## 3. Requisitos Não Funcionais

### RNF-01: Desempenho
- O sistema deve responder a uma consulta em até 3 segundos (excluindo o tempo de resposta da API externa)
- O dashboard deve ser carregado em até 1 segundo após o recebimento dos dados
- O sistema deve suportar pelo menos 100 consultas simultâneas

### RNF-02: Usabilidade
- A interface deve ser intuitiva e de fácil uso, mesmo para usuários não técnicos
- O sistema deve fornecer feedback claro durante o processo de consulta
- Mensagens de erro devem ser claras e orientadas à solução
- O sistema deve ser responsivo, adaptando-se a diferentes tamanhos de tela

### RNF-03: Segurança
- O sistema deve validar todas as entradas do usuário para prevenir injeções de código
- O acesso ao banco de dados deve ser protegido
- O histórico de consultas deve ser protegido contra acessos não autorizados

### RNF-04: Disponibilidade
- O sistema deve estar disponível 99% do tempo (excluindo manutenções programadas)
- O sistema deve degradar graciosamente em caso de falha na API externa

### RNF-05: Manutenibilidade
- O código deve seguir boas práticas de programação
- O sistema deve ser modular para facilitar futuras atualizações
- O sistema deve incluir logs adequados para diagnóstico de problemas

### RNF-06: Portabilidade
- O frontend deve funcionar nos principais navegadores (Chrome, Firefox, Safari, Edge)
- O sistema deve operar em ambientes Windows, Linux e macOS

### RNF-07: Identidade Visual
- O sistema deve incluir o logo da Febraban Tech 2025 no menu superior, lado direito
- O sistema deve incluir o logo da empresa TQI no menu superior, lado esquerdo
- O sistema deve utilizar as cores do logo da TQI na sua estilização

## 4. Épicos e User Stories

### Épico 1: Consulta de CNPJ e Análise de Risco

#### US-01: Entrada de CNPJ
**Como** analista de crédito,
**Eu quero** inserir o CNPJ de um cliente,
**Para que** eu possa obter informações sobre a empresa.

**Critérios de Aceitação:**
1. O sistema deve apresentar um campo para inserção do CNPJ
2. O campo deve aceitar apenas números
3. O sistema deve aplicar máscara de formatação automática (XX.XXX.XXX/YYYY-ZZ)
4. O sistema deve validar se o CNPJ inserido é válido (pelo algoritmo de dígitos verificadores)
5. Deve haver um botão "Analisar risco" para iniciar a consulta
6. O sistema deve exibir uma mensagem de erro clara se o CNPJ for inválido

**Prioridade:** Alta

#### US-02: Consulta de Dados via API
**Como** analista de crédito,
**Eu quero** que o sistema consulte dados públicos da empresa,
**Para que** eu possa ter informações atualizadas para análise.

**Critérios de Aceitação:**
1. O sistema deve consultar a API pública de CNPJ ao clicar em "Analisar risco"
2. O sistema deve exibir um indicador de carregamento durante a consulta
3. O sistema deve obter e processar corretamente os dados retornados pela API
4. O sistema deve tratar adequadamente os erros de comunicação com a API
5. O sistema deve informar ao usuário se a API estiver indisponível
6. O sistema deve validar os dados recebidos antes de processá-los

**Prioridade:** Alta

#### US-03: Cálculo de Score de Risco
**Como** analista de crédito,
**Eu quero** que o sistema calcule automaticamente um score de risco,
**Para que** eu possa avaliar rapidamente o nível de risco do cliente.

**Critérios de Aceitação:**
1. O sistema deve aplicar corretamente os critérios de pontuação definidos
2. O sistema deve classificar o risco com base no score total
3. O cálculo deve ser consistente e reproduzível
4. O sistema deve identificar corretamente os sinais de alerta
5. O sistema deve tratar adequadamente casos especiais ou dados faltantes

**Prioridade:** Alta

### Épico 2: Visualização de Resultados

#### US-04: Dashboard de Resultados
**Como** analista de crédito,
**Eu quero** visualizar os resultados da análise em um dashboard claro,
**Para que** eu possa compreender rapidamente o perfil de risco do cliente.

**Critérios de Aceitação:**
1. O dashboard deve exibir os dados cadastrais básicos do CNPJ consultado
2. O dashboard deve mostrar a classificação de risco (Baixo, Médio, Alto)
3. O dashboard deve apresentar um badge visual colorido indicando o nível de risco
4. O dashboard deve listar os critérios que impactaram o score, com suas pontuações
5. O dashboard deve destacar os sinais de alerta identificados
6. A apresentação deve ser clara e visualmente organizada

**Prioridade:** Alta

### Épico 3: Gerenciamento de Histórico

#### US-05: Armazenamento de Consultas
**Como** analista de crédito,
**Eu quero** que o sistema salve o resultado das minhas consultas,
**Para que** eu possa revisá-las posteriormente.

**Critérios de Aceitação:**
1. O sistema deve salvar automaticamente cada consulta no banco de dados
2. O sistema deve armazenar todos os dados relevantes da consulta
3. O armazenamento não deve impactar a performance da consulta
4. O sistema deve confirmar visualmente que a consulta foi salva

**Prioridade:** Média

#### US-06: Cache de Consultas Recentes
**Como** analista de crédito,
**Eu quero** que o sistema utilize dados em cache para consultas recentes,
**Para que** eu obtenha resultados mais rapidamente e reduza chamadas desnecessárias à API.

**Critérios de Aceitação:**
1. O sistema deve verificar se o CNPJ foi consultado nas últimas 24 horas
2. Se houver consulta recente, o sistema deve recuperar os dados do banco de dados
3. O sistema deve informar ao usuário que os dados são de uma consulta anterior
4. O sistema deve mostrar a data e hora da consulta original
5. O usuário deve ter a opção de forçar uma nova consulta à API, se desejar

**Prioridade:** Média

## 5. Glossário

**CNPJ:** Cadastro Nacional da Pessoa Jurídica, registro de identificação das empresas brasileiras mantido pela Receita Federal.

**CNAE:** Classificação Nacional de Atividades Econômicas, código que identifica a atividade econômica principal de uma empresa.

**API:** Application Programming Interface, conjunto de rotinas e padrões estabelecidos para acesso a dados ou funcionalidades de um sistema.

**Score de Risco:** Pontuação calculada a partir de diversos critérios para avaliar o nível de risco associado a uma empresa.

**Cache:** Armazenamento temporário de dados para acesso mais rápido em consultas futuras.

**Dashboard:** Painel visual que organiza e apresenta informações de maneira clara e concisa.

**Badge:** Elemento visual (selo) que indica visualmente uma classificação ou status.