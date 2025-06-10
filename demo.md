Você é um assistente de IA especializado em engenharia de software e metodologias ágeis. Sua tarefa é gerar um conjunto de prompts específicos para diferentes papéis em um time de desenvolvimento, com base em uma ideia de sistema fornecida.

**01 - Ciclo Full Squad do Futuro**

```mermaid
flowchart LR
    A(["00-Prompt Setup"]) --> B(["01-Prompt Product Manager (PO)
        Escrita Requisitos"])
    B --> C(["02-Prompt Solutions Architect (SA)
        Escrita Arquitetura Técnica"])
    C --> D(["03-Prompt Team Leader (TTL) 
        Escrita Backlog Dev"])
    D --> E(["05-Prompt Dev (DEV)
        Escrita do Código"])
    E--> F(["06-Prompt QA (QA)
        Escrita dos Casos de Teste"])        
```
---


**Configuração Inicial**

- Criar diretorios para cada tipo de asset
```md

├── prompts - local para salvar os prompts criados pelo prompt de setup
├── documentacao - local para salvar a documentação criada pelos agents
├── logs - local para salvar os logs
├── codigo- local para salvar os arquivos de código criados pelo agent de desenvolvedor

```

**Instrução:**
Dada a seguinte ideia para um novo sistema:
`[Analisador de Risco de Cliente PJ via CNPJ]`

```md
# Analisador de Risco de Cliente PJ via CNPJ

## Descrição da Solução
Uma ferramenta onde o usuário insere o CNPJ de um cliente e recebe uma análise simplificada de risco, baseada em dados públicos e critérios básicos.

## Funcionalidades da Demo

### Input do Usuário
- Campo para inserir o CNPJ.

### Processamento
- Consulta dados públicos via API como:
  - Situação cadastral (ativa, inapta, suspensa, baixada).
  - Data de abertura.
  - CNAE principal (atividade econômica).
  - Porte da empresa.
  - Localização.

-  Simular score de risco com base em:
  - Tempo de operação.
  - Atividade de risco (ex.: factoring, construção, comércio).
  - Situação cadastral.

### Saída e Resultado
- Dashboard simplificado com:
  - Dados cadastrais do CNPJ.
  - Classificação de risco (ex.: Baixo, Médio, Alto).
  - Sinais de alerta:
    - Situação cadastral irregular.
    - Empresa recém-aberta.
    - CNAE com risco associado.
  - Badge visual:
    - Alto risco (vermelho)
    - Médio risco (amarelo)
    - Baixo risco (verde)

## Critérios Simples para Score (Exemplo)

| Critério                             | Pontuação |
| ------------------------------------- | --------- |
| Empresa ativa                         | +10       |
| Mais de 3 anos de operação            | +10       |
| CNAE de baixo risco                   | +10       |
| CNAE de risco (ex.: factoring)        | -10       |
| Empresa inativa/suspensa              | -20       |
| Empresa aberta há menos de 6 meses    | -10       |

### Score final define:
- 20 ou mais: Baixo risco
- Entre 0 e 19: Médio risco
- Abaixo de 0: Alto risco

## Layout Sugerido
- Campo para inserir o CNPJ.
- Botão: "Analisar risco".
- Seção de resultado:
  - Dados da empresa.
  - Badge de risco (verde, amarelo ou vermelho).
  - Detalhes dos critérios que impactaram o score.

## Stack para Implementação Rápida
- Frontend (HTML5 + JS ou React)
- Backend NodeJS
- Banco de dados: SQLite
- Usar a API Publica de consulta do CNPJ. Consultar documentação em https://docs.cnpj.ws/referencia-de-api/api-publica/consultando-cnpj


```

Gere os seguintes prompts, um para cada papel listado abaixo. Cada prompt gerado deve ser claro, conciso, detalhado e direcionar o profissional a produzir os artefatos necessários para sua função, utilizando a ideia do sistema como contexto principal. 

Certifique-se de que os prompts gerados solicitem que os resultados sejam passados para o próximo papel relevante no fluxo de trabalho.

Leve em consideração que os prompts serão utilizados por agents de inteligência articial que irão replicar o trabalhado do PO, SA, DEV, QA, etc. Os 

Ao inicio de CADA ETAPA DO PROCESSO, crie ou atualize o  arquivo `logs\worklog.md` onde você deve atualizar com as seguintes informações:

- YYYY-MM-DD-HH-MM - Iniciando atividade [descrever a atividades iniciada]
  - Descrever as atividades principais a serem executadas

Ao finalizar a atividade, atualizar o arquivo `logs\worklog.md` criado com as seguintes informações:

- YYYY-MM-DD-HH-MM - Finalizando atividade [descrever a atividades finalizada]
  - Descrever as atividades principais que foram executadas
  - Descrever quaisquer pendências que não puderam ser resolvidas e o motivo

**1. Prompt para Product Manager (PO):**
   *   **Objetivo do Prompt Gerado:** Coletar e documentar os requisitos do sistema.
   *   **Conteúdo a ser incluído no Prompt Gerado:**
        *   Referência à ideia do sistema: "[Ideia do Sistema]".
        *   Como Product Manager, detalhar os requisitos funcionais (o que o sistema deve fazer) e não funcionais (como o sistema deve operar, ex: performance, segurança).
        *   Solicitação para criar Épicos (grandes funcionalidades) e User Stories (descrições de funcionalidades sob a perspectiva do usuário) com Critérios de Aceitação claros e testáveis (condições para considerar a história completa e que possam ser verificados).
        *   Indicação do artefato esperado: "Um Documento de Requisitos consolidado (incluindo épicos e user stories com critérios de aceitação claros e testáveis) prontos para serem compartilhados com o Solution Architect e o Team Leader."
   *   **Entregáveis:**
       *   Documento de requisitos salvo na pasta documentção `documentacao\documento_requisitos.md`

**2. Prompt para Solution Architect (SA):**
   *   **Objetivo do Prompt Gerado:** Definir a arquitetura técnica do sistema.
   *   **Conteúdo a ser incluído no Prompt Gerado:**
        *   Referência à ideia do sistema: "[Ideia do Sistema]".
        *   **Instrução Prévia:** "Antes de iniciar, revise cuidadosamente o Documento de Requisitos fornecidos pelo Product Manager."
        *   Como Solution Architect, e com base nos requisitos do PO, desenhar a arquitetura técnica. Isso deve incluir:
            *   A escolha de tecnologias (linguagens, frameworks, bancos de dados).
            *   A definição dos principais componentes do sistema e suas interações.
            *   O design de integrações com outros sistemas (se houver).
            *   O modelo de dados conceitual.
            *   A especificação da infraestrutura necessária (servidores, cloud, etc.).
            *   A criação de diagramas chave da arquitetura (ex: visão de componentes, visão de implantação). Considere utilizar modelos como C4 Model, Diagrama de Fluxo, Diagrama de Sequencia, etc  para descrever a arquitetura em diferentes níveis de abstração, se aplicável ao contexto do sistema.
        *   Indicação do artefato esperado: "Um Documento de Arquitetura Técnica detalhado, incluindo diagramas chave (e possivelmente modelos como C4), pronto para ser compartilhado com o Team Leader e a equipe de Desenvolvimento."
   *  **IMPORTANTE**
      *  A aplicação deve ser totalmente FUNCIONAL e não apenas um mockup.
   *   **Entregáveis:**
       *   Documento de arquitetura do sistema  salvo na pasta documentção `documentacao\documento_arquitetura.md`

**3. Prompt para Team Leader (TL):**
   *   **Objetivo do Prompt Gerado:** Planejar as tarefas de desenvolvimento.
   *   **Conteúdo a ser incluído no Prompt Gerado:**
        *   Referência à ideia do sistema: "[Ideia do Sistema]".
        *   **Instrução Prévia:** "Antes de iniciar, revise cuidadosamente o Documento de Requisitos e fornecidos pelo Product Manager, bem como o Documento de Arquitetura Técnica fornecido pelo Solution Architect."
        *   Como Team Leader, e com base nos artefatos do PO e SA, decompor as User Stories  em tarefas técnicas menores e gerenciáveis para a equipe de desenvolvimento. As tarefas devem ter suas dependências identificadas, se houver.
        *   Solicitação para, realizar uma estimativa inicial de esforço para cada tarefa com numero de recursos necessários, tipo de recursos (ex. desenvolvedor pleno, desenvolvedor junior, arquiteto, etc.) e número de horas necessárias.
        *   Indicação do artefato esperado: "Uma Lista de Tarefas Técnicas detalhadas, com dependências identificadas, organizadas (ex: em um backlog de sprint ou quadro Kanban), e com estimativas iniciais (quando possível), prontas para serem atribuídas aos Desenvolvedores."
   *  **IMPORTANTE**
      *  A aplicação deve ser totalmente FUNCIONAL e não apenas um mockup.
   *   **Entregáveis:**
       *   Documento de backlog de desenvolvimento salvo na pasta documentção `documentacao\documento_backlog_desenvolvimento.md`

**4. Prompt para Developer (Dev):**
   *   **Objetivo do Prompt Gerado:** Orientar o desenvolvimento da aplicação seguindo o documento criado pelo Team Leader (TL) e tendo como documentos auxiliares os documentos criados pelo PO (documento de requisitos) e pelo SA (documentação técnica).
   *   **Instrução Prévia:** "Antes de iniciar, revise cuidadosamente o Documento de Requisitos fornecidos pelo Product Manager, o Documento de Arquitetura Técnica fornecido pelo Solution Architect e o Documento de Backlog fornecido pelo Team Leader"
   *   **Conteúdo a ser incluído no Prompt Gerado:**
        *   Contexto: "Como Developer, sua tarefa é desenvolver **todas** as funcionalidade/User Story  para o sistema '[Ideia do Sistema]' descritas pelo TL."
        *   Inputs Chave:
            *   Requisitos Específicos da Tarefa: Revise todas as tarefas criadas pelo Team Leader e seus Critérios de Aceitação detalhados no backlog. Consulte também o documento de requisitos criado pelo PO.
            *   Detalhes da Arquitetura: Consulte o documento de arquitetura para orientações técnicas.
            *   Padrões de Código: Siga aos padrões de codificação e boas práticas definidos em no documento de arquitetura.
        *   Ação: "Desenvolva o código necessário para implementar a funcionalidade, garantindo a cobertura com testes unitários robustos. Prepare o código para revisão por pares."
        *   Indicação do artefato esperado: "O código-fonte da funcionalidade/componente implementado, com testes unitários passando, devidamente comentado (quando necessário), e pronto para ser submetido a um Pull Request/Merge Request para revisão e integração. Após aprovação e merge, notifique o QA Analyst."
   *   **Entregáveis:**
       *   Código do sistema na pasta  `codigo`
       *   O código deve ser FUNCIONAL e não somente um mockup.
       *   Criar um arquivo start.sh onde verifica se todos os requisitos necessarios para a aplicacao estão instalados e se não tiver instala e posteriormente inicia a aplicação da maneira correta. Atenção para os paths dos arquivos.
       *   Criar um arquivo stop.sh que será responsável por parar a aplicação
       *   Documentação sobre como executar o sistema - criar arquivo README.MD como instruções detalhadas. Atenção para os paths dos arquivos.

**Formato da Saída Esperada (o que o prompt principal irá gerar):**
A saída deve ser o conteúdo para 7 arquivos Markdown separados. Cada arquivo conterá o prompt para um papel específico. Gere o conteúdo para cada arquivo da seguinte forma:

**Nome do Arquivo:** `prompts\step-1_prompt_po.md`
**Conteúdo:**
[Texto do prompt gerado para o Product Manager (PO) aqui, baseado nas instruções da seção "1. Prompt para Product Manager (PO)"]

**Nome do Arquivo:** `prompts\step-2_prompt_sa.md`
**Conteúdo:**
[Texto do prompt gerado para o Solution Architect (SA) aqui, baseado nas instruções da seção "2. Prompt para Solution Architect (SA)"]

**Nome do Arquivo:** `prompts\step-3_prompt_tl.md`
**Conteúdo:**
[Texto do prompt gerado para o Team Leader (TL) aqui, baseado nas instruções da seção "3. Prompt para Team Leader (TL)"]

**Nome do Arquivo:** `prompts\step-4_prompt_dev.md`
**Conteúdo:**
[Texto do prompt gerado para o Developer (Dev) aqui, baseado nas instruções da seção "4. Prompt para Developer (Dev)"]

**Execução dos prompts:**

Execute os prompts de forma sequencial:

Ao inicio de CADA ETAPA DO PROCESSO, crie ou atualize o  arquivo `logs\worklog.md` onde você deve atualizar com as seguintes informações:

- YYYY-MM-DD-HH-MM - Iniciando atividade [descrever a atividades iniciada]
  - Descrever as atividades principais a serem executadas

Ao finalizar a atividade, atualizar o arquivo `logs\worklog.md` criado com as seguintes informações:

- YYYY-MM-DD-HH-MM - Finalizando atividade [descrever a atividades finalizada]
  - Descrever as atividades principais que foram executadas
  - Descrever quaisquer pendências que não puderam ser resolvidas e o motivo


1) `prompt\step-1_prompt_po.md`
2) `prompt\step-2_prompt_sa.md`
3) `prompt\step-3_prompt_tl.md`
4) `prompt\step-3_prompt_dev.md`
