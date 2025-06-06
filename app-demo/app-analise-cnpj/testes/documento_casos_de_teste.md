# Documento de Casos de Teste: Analisador de Risco de Cliente PJ via CNPJ

## Informações do Documento

| **Projeto** | Analisador de Risco de Cliente PJ via CNPJ |
|-------------|------------------------------------------|
| **Criado por** | QA Analyst |
| **Data de Criação** | 2025-06-06 |
| **Versão** | 1.0 |

## 1. Introdução

### 1.1 Objetivo

Este documento descreve os casos de teste para verificação e validação do sistema "Analisador de Risco de Cliente PJ via CNPJ". Os testes têm como objetivo garantir que todas as funcionalidades do sistema estejam operando conforme especificado nos requisitos, que o sistema seja robusto o suficiente para lidar com entradas inválidas ou inesperadas, e que atenda a todos os requisitos não funcionais estabelecidos.

### 1.2 Escopo

O escopo deste documento inclui:
- Testes funcionais para verificar todas as user stories e critérios de aceitação
- Testes de integração para validar a comunicação com a API de CNPJ
- Testes de performance para verificar o tempo de resposta
- Testes de usabilidade para garantir uma boa experiência do usuário
- Testes de segurança básicos

### 1.3 Documentos de Referência

- Documento de Requisitos (`documentacao/documento_requisitos.md`)
- Documento de Arquitetura Técnica (`documentacao/documento_arquitetura.md`)
- Documento de Backlog de Desenvolvimento (`documentacao/documento_backlog_desenvolvimento.md`)
- README.md com instruções de execução

## 2. Ambiente de Teste

### 2.1 Requisitos de Hardware

- CPU: Qualquer processador x86_64 moderno
- RAM: Mínimo de 2GB
- Espaço em disco: Mínimo de 500MB disponíveis

### 2.2 Requisitos de Software

- Sistema Operacional: Windows 10+, macOS 10.15+, ou Ubuntu 20.04+
- Node.js: versão 14.x ou superior
- npm: versão 6.x ou superior
- Navegadores: Chrome 90+, Firefox 90+, Edge 90+

### 2.3 Configuração do Ambiente

1. Clone o repositório
2. Navegue até a pasta do projeto
3. Execute o script `start.sh` para instalar dependências e iniciar a aplicação
4. Acesse http://localhost:3000 no navegador

## 3. Casos de Teste

### 3.1 Testes Funcionais

#### 3.1.1 US-01: Entrada de CNPJ

| **ID** | **TC-01-01** |
|--------|--------------|
| **Título** | Validação de formato de CNPJ |
| **User Story** | US-01: Entrada de CNPJ |
| **Critério de Aceitação** | O sistema deve validar se o CNPJ inserido é válido (pelo algoritmo de dígitos verificadores) |
| **Pré-condições** | Sistema acessível e operacional |
| **Passos** | 1. Acessar a página inicial da aplicação<br>2. Inserir um CNPJ com formato inválido (ex: 12.345.678/0001-00)<br>3. Clicar no botão "Analisar Risco" |
| **Resultado Esperado** | Sistema deve exibir mensagem de erro indicando que o CNPJ é inválido |
| **Dados de Teste** | CNPJ Inválido: 12.345.678/0001-00 |
| **Prioridade** | Alta |

| **ID** | **TC-01-02** |
|--------|--------------|
| **Título** | Aplicação de máscara de CNPJ |
| **User Story** | US-01: Entrada de CNPJ |
| **Critério de Aceitação** | O sistema deve aplicar máscara de formatação automática (XX.XXX.XXX/YYYY-ZZ) |
| **Pré-condições** | Sistema acessível e operacional |
| **Passos** | 1. Acessar a página inicial da aplicação<br>2. Digitar apenas números no campo de CNPJ (sem pontuação) |
| **Resultado Esperado** | O sistema deve formatar automaticamente o CNPJ conforme o padrão XX.XXX.XXX/YYYY-ZZ enquanto o usuário digita |
| **Dados de Teste** | Entrada: 00000000000191<br>Formatação esperada: 00.000.000/0001-91 |
| **Prioridade** | Média |

| **ID** | **TC-01-03** |
|--------|--------------|
| **Título** | Envio de CNPJ ao pressionar Enter |
| **User Story** | US-01: Entrada de CNPJ |
| **Critério de Aceitação** | O sistema deve iniciar a consulta quando o usuário pressionar Enter |
| **Pré-condições** | Sistema acessível e operacional |
| **Passos** | 1. Acessar a página inicial da aplicação<br>2. Inserir um CNPJ válido (ex: 00.000.000/0001-91)<br>3. Pressionar a tecla Enter |
| **Resultado Esperado** | O sistema deve iniciar a consulta da mesma forma que se o botão "Analisar Risco" fosse clicado |
| **Dados de Teste** | CNPJ Válido: 00.000.000/0001-91 |
| **Prioridade** | Baixa |

#### 3.1.2 US-02: Consulta de Dados via API

| **ID** | **TC-02-01** |
|--------|--------------|
| **Título** | Consulta à API de CNPJ com sucesso |
| **User Story** | US-02: Consulta de Dados via API |
| **Critério de Aceitação** | O sistema deve consultar a API pública de CNPJ e obter os dados corretamente |
| **Pré-condições** | Sistema acessível e operacional<br>Conexão com internet disponível |
| **Passos** | 1. Acessar a página inicial da aplicação<br>2. Inserir um CNPJ válido e existente (ex: 00.000.000/0001-91)<br>3. Clicar no botão "Analisar Risco" |
| **Resultado Esperado** | O sistema deve exibir um indicador de carregamento durante a consulta e depois mostrar os dados da empresa consultada |
| **Dados de Teste** | CNPJ Válido: 00.000.000/0001-91 (Banco do Brasil) |
| **Prioridade** | Alta |

| **ID** | **TC-02-02** |
|--------|--------------|
| **Título** | Tratamento de CNPJ inexistente |
| **User Story** | US-02: Consulta de Dados via API |
| **Critério de Aceitação** | O sistema deve tratar adequadamente os erros de comunicação com a API |
| **Pré-condições** | Sistema acessível e operacional<br>Conexão com internet disponível |
| **Passos** | 1. Acessar a página inicial da aplicação<br>2. Inserir um CNPJ válido mas inexistente<br>3. Clicar no botão "Analisar Risco" |
| **Resultado Esperado** | O sistema deve exibir uma mensagem de erro informando que o CNPJ não foi encontrado na base de dados |
| **Dados de Teste** | CNPJ Válido mas inexistente: 11.111.111/1111-11 |
| **Prioridade** | Alta |

| **ID** | **TC-02-03** |
|--------|--------------|
| **Título** | Tratamento de falha na conexão com a API |
| **User Story** | US-02: Consulta de Dados via API |
| **Critério de Aceitação** | O sistema deve informar ao usuário se a API estiver indisponível |
| **Pré-condições** | Sistema acessível e operacional<br>Conexão com internet indisponível ou bloqueada |
| **Passos** | 1. Desconectar o computador da internet ou bloquear a conexão com a API<br>2. Acessar a página inicial da aplicação<br>3. Inserir um CNPJ válido (ex: 00.000.000/0001-91)<br>4. Clicar no botão "Analisar Risco" |
| **Resultado Esperado** | O sistema deve exibir uma mensagem de erro informando que não foi possível conectar ao servidor da API |
| **Dados de Teste** | CNPJ Válido: 00.000.000/0001-91 |
| **Prioridade** | Alta |

#### 3.1.3 US-03: Cálculo de Score de Risco

| **ID** | **TC-03-01** |
|--------|--------------|
| **Título** | Cálculo de score para empresa ativa e estabelecida |
| **User Story** | US-03: Cálculo de Score de Risco |
| **Critério de Aceitação** | O sistema deve aplicar corretamente os critérios de pontuação definidos |
| **Pré-condições** | Sistema acessível e operacional<br>API de CNPJ disponível |
| **Passos** | 1. Acessar a página inicial da aplicação<br>2. Inserir o CNPJ de uma empresa ativa e com mais de 3 anos de operação<br>3. Clicar no botão "Analisar Risco" |
| **Resultado Esperado** | O sistema deve calcular o score corretamente, atribuindo +10 pontos por empresa ativa e +10 pontos por ter mais de 3 anos de operação |
| **Dados de Teste** | CNPJ de empresa ativa e estabelecida: 00.000.000/0001-91 (Banco do Brasil) |
| **Prioridade** | Alta |

| **ID** | **TC-03-02** |
|--------|--------------|
| **Título** | Classificação correta de risco baixo |
| **User Story** | US-03: Cálculo de Score de Risco |
| **Critério de Aceitação** | O sistema deve classificar o risco com base no score total |
| **Pré-condições** | Sistema acessível e operacional<br>API de CNPJ disponível |
| **Passos** | 1. Acessar a página inicial da aplicação<br>2. Inserir o CNPJ de uma empresa com características que resultem em score >= 20<br>3. Clicar no botão "Analisar Risco" |
| **Resultado Esperado** | O sistema deve classificar a empresa como "Baixo Risco" e exibir um badge verde |
| **Dados de Teste** | CNPJ que deve resultar em Baixo Risco: 00.000.000/0001-91 (Banco do Brasil) |
| **Prioridade** | Alta |

| **ID** | **TC-03-03** |
|--------|--------------|
| **Título** | Cálculo de score para empresa inativa |
| **User Story** | US-03: Cálculo de Score de Risco |
| **Critério de Aceitação** | O sistema deve identificar corretamente os sinais de alerta |
| **Pré-condições** | Sistema acessível e operacional<br>API de CNPJ disponível |
| **Passos** | 1. Acessar a página inicial da aplicação<br>2. Inserir o CNPJ de uma empresa inativa/suspensa<br>3. Clicar no botão "Analisar Risco" |
| **Resultado Esperado** | O sistema deve calcular o score corretamente, atribuindo -20 pontos por empresa inativa/suspensa e exibir este critério como um sinal de alerta |
| **Dados de Teste** | CNPJ de empresa inativa (selecionar um CNPJ apropriado durante a execução do teste) |
| **Prioridade** | Alta |

#### 3.1.4 US-04: Dashboard de Resultados

| **ID** | **TC-04-01** |
|--------|--------------|
| **Título** | Exibição correta dos dados cadastrais |
| **User Story** | US-04: Dashboard de Resultados |
| **Critério de Aceitação** | O dashboard deve exibir os dados cadastrais básicos do CNPJ consultado |
| **Pré-condições** | Sistema acessível e operacional<br>Consulta de CNPJ realizada com sucesso |
| **Passos** | 1. Acessar a página inicial da aplicação<br>2. Inserir um CNPJ válido (ex: 00.000.000/0001-91)<br>3. Clicar no botão "Analisar Risco"<br>4. Aguardar o carregamento dos resultados |
| **Resultado Esperado** | O dashboard deve exibir corretamente os dados cadastrais: CNPJ, Razão Social, Situação Cadastral, Data de Abertura, CNAE Principal, Porte, Município e UF |
| **Dados de Teste** | CNPJ Válido: 00.000.000/0001-91 (Banco do Brasil) |
| **Prioridade** | Alta |

| **ID** | **TC-04-02** |
|--------|--------------|
| **Título** | Exibição correta do badge de risco |
| **User Story** | US-04: Dashboard de Resultados |
| **Critério de Aceitação** | O dashboard deve apresentar um badge visual colorido indicando o nível de risco |
| **Pré-condições** | Sistema acessível e operacional<br>Consulta de CNPJ realizada com sucesso |
| **Passos** | 1. Realizar três consultas com CNPJs que resultem em classificações diferentes de risco<br>2. Observar o badge exibido em cada caso |
| **Resultado Esperado** | O sistema deve exibir:<br>- Badge verde para Baixo Risco<br>- Badge amarelo para Médio Risco<br>- Badge vermelho para Alto Risco |
| **Dados de Teste** | Selecionar CNPJs apropriados para cada nível de risco durante a execução do teste |
| **Prioridade** | Alta |

| **ID** | **TC-04-03** |
|--------|--------------|
| **Título** | Exibição dos critérios aplicados |
| **User Story** | US-04: Dashboard de Resultados |
| **Critério de Aceitação** | O dashboard deve listar os critérios que impactaram o score, com suas pontuações |
| **Pré-condições** | Sistema acessível e operacional<br>Consulta de CNPJ realizada com sucesso |
| **Passos** | 1. Acessar a página inicial da aplicação<br>2. Inserir um CNPJ válido (ex: 00.000.000/0001-91)<br>3. Clicar no botão "Analisar Risco"<br>4. Aguardar o carregamento dos resultados<br>5. Verificar a seção "Critérios Aplicados" |
| **Resultado Esperado** | O sistema deve listar todos os critérios aplicados no cálculo do score, mostrando a descrição de cada critério e sua respectiva pontuação (positiva em verde, negativa em vermelho) |
| **Dados de Teste** | CNPJ Válido: 00.000.000/0001-91 (Banco do Brasil) |
| **Prioridade** | Média |

#### 3.1.5 US-05: Armazenamento de Consultas

| **ID** | **TC-05-01** |
|--------|--------------|
| **Título** | Armazenamento de consulta no banco de dados |
| **User Story** | US-05: Armazenamento de Consultas |
| **Critério de Aceitação** | O sistema deve salvar automaticamente cada consulta no banco de dados |
| **Pré-condições** | Sistema acessível e operacional<br>Banco de dados operacional |
| **Passos** | 1. Acessar a página inicial da aplicação<br>2. Inserir um CNPJ válido (ex: 00.000.000/0001-91)<br>3. Clicar no botão "Analisar Risco"<br>4. Aguardar o carregamento dos resultados<br>5. Verificar no banco de dados se a consulta foi salva |
| **Resultado Esperado** | O banco de dados deve conter um registro na tabela "consultas" com os dados da consulta realizada |
| **Dados de Teste** | CNPJ Válido: 00.000.000/0001-91 (Banco do Brasil) |
| **Prioridade** | Alta |

| **ID** | **TC-05-02** |
|--------|--------------|
| **Título** | Armazenamento dos critérios aplicados |
| **User Story** | US-05: Armazenamento de Consultas |
| **Critério de Aceitação** | O sistema deve armazenar todos os dados relevantes da consulta |
| **Pré-condições** | Sistema acessível e operacional<br>Banco de dados operacional<br>Consulta de CNPJ realizada com sucesso |
| **Passos** | 1. Acessar a página inicial da aplicação<br>2. Inserir um CNPJ válido (ex: 00.000.000/0001-91)<br>3. Clicar no botão "Analisar Risco"<br>4. Aguardar o carregamento dos resultados<br>5. Verificar no banco de dados se os critérios aplicados foram salvos |
| **Resultado Esperado** | O banco de dados deve conter registros na tabela "criterios_aplicados" relacionados à consulta realizada |
| **Dados de Teste** | CNPJ Válido: 00.000.000/0001-91 (Banco do Brasil) |
| **Prioridade** | Média |

#### 3.1.6 US-06: Cache de Consultas Recentes

| **ID** | **TC-06-01** |
|--------|--------------|
| **Título** | Uso de cache para consultas recentes |
| **User Story** | US-06: Cache de Consultas Recentes |
| **Critério de Aceitação** | O sistema deve verificar se o CNPJ foi consultado nas últimas 24 horas |
| **Pré-condições** | Sistema acessível e operacional<br>Banco de dados operacional<br>Consulta prévia do mesmo CNPJ realizada há menos de 24 horas |
| **Passos** | 1. Acessar a página inicial da aplicação<br>2. Inserir um CNPJ que foi consultado anteriormente<br>3. Clicar no botão "Analisar Risco" |
| **Resultado Esperado** | O sistema deve recuperar os dados do banco de dados (sem chamar a API) e exibir um alerta informando que os dados são de uma consulta anterior |
| **Dados de Teste** | CNPJ consultado previamente (realizar uma consulta inicial antes de executar este teste) |
| **Prioridade** | Alta |

| **ID** | **TC-06-02** |
|--------|--------------|
| **Título** | Forçar atualização de dados em cache |
| **User Story** | US-06: Cache de Consultas Recentes |
| **Critério de Aceitação** | O usuário deve ter a opção de forçar uma nova consulta à API, se desejar |
| **Pré-condições** | Sistema acessível e operacional<br>Banco de dados operacional<br>Consulta prévia do mesmo CNPJ realizada há menos de 24 horas |
| **Passos** | 1. Acessar a página inicial da aplicação<br>2. Inserir um CNPJ que foi consultado anteriormente<br>3. Clicar no botão "Analisar Risco"<br>4. Quando o alerta de dados em cache aparecer, clicar no botão "Atualizar dados" |
| **Resultado Esperado** | O sistema deve realizar uma nova consulta à API, ignorando os dados em cache, e exibir os dados atualizados |
| **Dados de Teste** | CNPJ consultado previamente (realizar uma consulta inicial antes de executar este teste) |
| **Prioridade** | Média |

### 3.2 Testes de Integração

| **ID** | **TC-INT-01** |
|--------|---------------|
| **Título** | Integração com API de CNPJ |
| **Objetivo** | Verificar se o sistema integra corretamente com a API externa de CNPJ |
| **Pré-condições** | Sistema em execução<br>Conexão com internet disponível |
| **Passos** | 1. Acessar a aplicação<br>2. Inserir um CNPJ válido e existente<br>3. Clicar no botão "Analisar Risco"<br>4. Verificar os logs da aplicação |
| **Resultado Esperado** | Os logs devem mostrar:<br>1. Requisição feita à API de CNPJ<br>2. Resposta recebida com sucesso<br>3. Dados processados corretamente |
| **Dados de Teste** | CNPJ Válido: 00.000.000/0001-91 (Banco do Brasil) |
| **Prioridade** | Alta |

| **ID** | **TC-INT-02** |
|--------|---------------|
| **Título** | Integração entre Frontend e Backend |
| **Objetivo** | Verificar se o frontend e o backend se comunicam corretamente |
| **Pré-condições** | Sistema em execução |
| **Passos** | 1. Abrir as ferramentas de desenvolvedor do navegador (F12)<br>2. Acessar a aba "Network"<br>3. Acessar a aplicação<br>4. Inserir um CNPJ válido e existente<br>5. Clicar no botão "Analisar Risco"<br>6. Observar as requisições HTTP realizadas |
| **Resultado Esperado** | Deve haver uma requisição POST para `/api/cnpj` com o CNPJ no corpo da requisição, e uma resposta com status 200 contendo os dados da análise |
| **Dados de Teste** | CNPJ Válido: 00.000.000/0001-91 (Banco do Brasil) |
| **Prioridade** | Alta |

### 3.3 Testes de Performance

| **ID** | **TC-PERF-01** |
|--------|----------------|
| **Título** | Tempo de resposta para consulta nova |
| **Objetivo** | Verificar se o sistema responde dentro do tempo esperado para uma consulta nova |
| **Pré-condições** | Sistema em execução<br>Conexão com internet disponível |
| **Passos** | 1. Acessar a aplicação<br>2. Inserir um CNPJ válido e existente que não foi consultado recentemente<br>3. Clicar no botão "Analisar Risco"<br>4. Medir o tempo de resposta |
| **Resultado Esperado** | O tempo total desde o clique no botão até a exibição dos resultados deve ser inferior a 5 segundos (considerando uma conexão de internet estável) |
| **Dados de Teste** | CNPJ Válido: 00.000.000/0001-91 (Banco do Brasil) |
| **Prioridade** | Média |

| **ID** | **TC-PERF-02** |
|--------|----------------|
| **Título** | Tempo de resposta para consulta em cache |
| **Objetivo** | Verificar se o sistema responde mais rapidamente para consultas em cache |
| **Pré-condições** | Sistema em execução<br>Consulta prévia do mesmo CNPJ realizada há menos de 24 horas |
| **Passos** | 1. Acessar a aplicação<br>2. Inserir um CNPJ que foi consultado anteriormente<br>3. Clicar no botão "Analisar Risco"<br>4. Medir o tempo de resposta |
| **Resultado Esperado** | O tempo total desde o clique no botão até a exibição dos resultados deve ser inferior a 2 segundos |
| **Dados de Teste** | CNPJ consultado previamente (realizar uma consulta inicial antes de executar este teste) |
| **Prioridade** | Média |

### 3.4 Testes de Usabilidade

| **ID** | **TC-USAB-01** |
|--------|----------------|
| **Título** | Responsividade em diferentes dispositivos |
| **Objetivo** | Verificar se a interface se adapta corretamente a diferentes tamanhos de tela |
| **Pré-condições** | Sistema em execução<br>Ferramentas de desenvolvedor do navegador disponíveis |
| **Passos** | 1. Acessar a aplicação<br>2. Abrir as ferramentas de desenvolvedor do navegador (F12)<br>3. Ativar o modo de visualização responsiva<br>4. Testar diferentes tamanhos de tela (desktop, tablet, mobile)<br>5. Realizar uma consulta de CNPJ em cada tamanho de tela |
| **Resultado Esperado** | A interface deve se adaptar aos diferentes tamanhos de tela, mantendo todos os elementos visíveis e utilizáveis |
| **Dados de Teste** | N/A |
| **Prioridade** | Média |

| **ID** | **TC-USAB-02** |
|--------|----------------|
| **Título** | Feedback visual durante carregamento |
| **Objetivo** | Verificar se o sistema fornece feedback adequado durante o processamento |
| **Pré-condições** | Sistema em execução |
| **Passos** | 1. Acessar a aplicação<br>2. Inserir um CNPJ válido e existente<br>3. Clicar no botão "Analisar Risco" |
| **Resultado Esperado** | O sistema deve exibir um indicador de carregamento (spinner) enquanto processa a consulta |
| **Dados de Teste** | CNPJ Válido: 00.000.000/0001-91 (Banco do Brasil) |
| **Prioridade** | Alta |

### 3.5 Testes de Segurança

| **ID** | **TC-SEC-01** |
|--------|---------------|
| **Título** | Validação de entrada contra injeção |
| **Objetivo** | Verificar se o sistema valida adequadamente as entradas do usuário |
| **Pré-condições** | Sistema em execução |
| **Passos** | 1. Acessar a aplicação<br>2. Tentar inserir caracteres especiais e código malicioso no campo de CNPJ<br>3. Clicar no botão "Analisar Risco" |
| **Resultado Esperado** | O sistema deve rejeitar ou sanitizar adequadamente a entrada, impedindo qualquer injeção de código |
| **Dados de Teste** | Entradas maliciosas como: `<script>alert('XSS')</script>`, `' OR 1=1 --` |
| **Prioridade** | Alta |

## 4. Dados de Teste

### 4.1 CNPJs para Teste

| **CNPJ** | **Empresa** | **Características** | **Resultado Esperado** |
|----------|-------------|---------------------|------------------------|
| 00.000.000/0001-91 | Banco do Brasil | Empresa ativa, mais de 3 anos, CNAE de baixo risco | Baixo Risco |
| 33.000.167/0001-01 | Petrobras | Empresa ativa, mais de 3 anos | Baixo/Médio Risco |
| [Selecionar CNPJ de empresa recém-aberta] | - | Empresa com menos de 6 meses | Médio/Alto Risco |
| [Selecionar CNPJ de empresa inativa] | - | Empresa inativa/suspensa | Alto Risco |
| 11.111.111/1111-11 | Inexistente | CNPJ válido mas inexistente | Erro: CNPJ não encontrado |
| 12.345.678/0001-00 | - | CNPJ com formato inválido | Erro: CNPJ inválido |

## 5. Priorização de Testes

A execução dos testes deve seguir a seguinte ordem de prioridade:

1. **Testes de funcionalidades críticas**:
   - Validação de CNPJ (TC-01-01)
   - Consulta à API (TC-02-01, TC-02-02, TC-02-03)
   - Cálculo de score (TC-03-01, TC-03-02)
   - Exibição de resultados (TC-04-01, TC-04-02)

2. **Testes de integração**:
   - Integração com API de CNPJ (TC-INT-01)
   - Integração Frontend-Backend (TC-INT-02)

3. **Testes de segurança**:
   - Validação de entrada (TC-SEC-01)

4. **Testes de funcionalidades secundárias**:
   - Armazenamento (TC-05-01)
   - Cache (TC-06-01, TC-06-02)
   - Demais testes funcionais

5. **Testes de performance e usabilidade**:
   - Tempo de resposta (TC-PERF-01, TC-PERF-02)
   - Responsividade (TC-USAB-01)
   - Feedback visual (TC-USAB-02)

## 6. Estratégia de Execução

### 6.1 Ciclos de Teste

Os testes serão executados em 3 ciclos:

1. **Ciclo 1**: Testes funcionais básicos e críticos
2. **Ciclo 2**: Testes de integração, segurança e funcionalidades secundárias
3. **Ciclo 3**: Testes de performance, usabilidade e regressão

### 6.2 Critérios de Entrada/Saída

**Critérios de Entrada**:
- Ambiente de teste configurado conforme especificado
- Documentação de requisitos e arquitetura disponível e revisada
- Código da aplicação implementado e disponível para teste

**Critérios de Saída**:
- Todos os testes de alta prioridade executados
- 90% dos testes de média prioridade executados
- Não há bugs críticos ou de alta severidade em aberto
- Todos os requisitos funcionais críticos verificados e validados

## 7. Rastreabilidade

| **ID do Caso de Teste** | **User Story / Requisito** |
|-------------------------|----------------------------|
| TC-01-01, TC-01-02, TC-01-03 | US-01: Entrada de CNPJ |
| TC-02-01, TC-02-02, TC-02-03 | US-02: Consulta de Dados via API |
| TC-03-01, TC-03-02, TC-03-03 | US-03: Cálculo de Score de Risco |
| TC-04-01, TC-04-02, TC-04-03 | US-04: Dashboard de Resultados |
| TC-05-01, TC-05-02 | US-05: Armazenamento de Consultas |
| TC-06-01, TC-06-02 | US-06: Cache de Consultas Recentes |
| TC-INT-01, TC-INT-02 | Requisitos de Integração |
| TC-PERF-01, TC-PERF-02 | RNF-01: Desempenho |
| TC-USAB-01, TC-USAB-02 | RNF-02: Usabilidade |
| TC-SEC-01 | RNF-03: Segurança |

## 8. Riscos e Mitigações

| **Risco** | **Mitigação** |
|-----------|---------------|
| Indisponibilidade da API de CNPJ | Preparar dados de teste simulados para usar quando a API não estiver disponível |
| Tempo insuficiente para execução de todos os testes | Priorizar os testes críticos conforme definido na seção 5 |
| Ambiente de teste instável | Criar um procedimento de configuração passo a passo e verificar o ambiente antes de iniciar os testes |
| Falta de CNPJs reais para todos os cenários de teste | Coordenar com a equipe de desenvolvimento para criar mocks que simulem os diferentes cenários |

## 9. Conclusão

Este plano de testes foi desenvolvido para garantir a qualidade do sistema "Analisador de Risco de Cliente PJ via CNPJ". Ele abrange testes funcionais e não funcionais, com foco nos requisitos críticos do sistema. A execução diligente destes testes ajudará a identificar problemas e garantir que o sistema atenda às expectativas dos usuários e às especificações definidas.