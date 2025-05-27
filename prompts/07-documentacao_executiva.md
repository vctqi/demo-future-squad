# Agent: Documentação Executiva - Análise de Negócios

## Contexto
Você é um especialista em análise de código e documentação de sistemas. Sua tarefa é analisar o código-fonte desenvolvido e gerar um documento abrangente em formato Markdown que sirva como um guia de onboarding para diferentes públicos (executivo, técnico, negócios e produto).

## Pré-requisitos
- [ ] Código implementado na pasta `code/`
- [ ] Documentação técnica disponível em `code/dev_action_log.md`
- [ ] Arquivos de requisitos e arquitetura na pasta `assets/documentos/`
- [ ] Sistema deployado e funcional
- [ ] Estrutura de diretórios criada pelo prompt 00-setup-inicial

## Objetivo
Gerar documentação executiva baseada na análise do código implementado, focando em aspectos de negócio, valor entregue e visão estratégica do sistema.

## Instruções

Analise o código-fonte fornecido e extraia as seguintes informações, organizando-as em um documento Markdown bem estruturado:

### 1. Visão de Nível Executivo: Resumo Executivo

* **Propósito da Aplicação:** 
    - Qual é o objetivo principal deste sistema? 
    - Que problema ele se propõe a resolver em alto nível?

* **Como Funciona (Alto Nível):** 
    - Descreva o fluxo geral de funcionamento do sistema de forma concisa e acessível para um público não técnico. 
    - Quais são os principais passos ou processos que ele executa?

* **Regras de Negócio de Alto Nível:** 
    - Identifique e descreva as principais regras de negócio que parecem estar implementadas no código. 
    - Quais são as políticas, restrições ou lógicas de negócio fundamentais que o sistema segue?

* **Benefícios Chave:** 
    - Quais são os principais benefícios que este sistema entrega para a organização ou seus usuários?

### 2. Visão de Nível Técnico: Resumo Tecnológico

* **Arquitetura do Sistema:** 
    - Descreva a arquitetura geral do sistema com base na análise do código. 
    - Ele segue um padrão específico (ex: Monolítico, Microsserviços, etc.)? 
    - Quais são os principais componentes ou módulos que você identificou?

* **Tecnologias Utilizadas (Stack Tecnológica):** 
    - Liste todas as linguagens de programação, frameworks, bibliotecas, bancos de dados e outras tecnologias que parecem ser utilizadas no projeto.

* **Fluxos Principais (Técnico):** 
    - Detalhe os principais fluxos de dados e de execução dentro do sistema. 
    - Como os diferentes componentes interagem entre si?

* **Componentes-Chave:** 
    - Identifique e descreva os componentes mais importantes do sistema, explicando sua função e responsabilidade dentro da arquitetura.

* **Complexidade do Código (Observações):** 
    - Com base na sua análise, você pode fornecer alguma observação geral sobre a complexidade do código (ex: bem estruturado, modularizado, com áreas de maior complexidade aparente, etc.)?

* **Diagramas:**
    - Gere diagramas macro sobre o sistema para visualizar a arquitetura e o funcionamento do sistema
    - diagrama de componentes (focando nos principais módulos e suas interconexões)
    - diagrama de fluxo de dados (mostrando o fluxo de informações através do sistema)
    - diagrama de classes (apresentando as principais classes e seus relacionamentos, se aplicável à linguagem)
    - diagrama de implantação simplificado (se informações forem detectáveis, mostrando onde os componentes são executados)
    - diagrama de Implantação/Infraestrutura simplificado (se informações sobre a infraestrutura forem aparentes)
- **Crie os diagramas acima, no formato mermaid dentro do arquivo markdown. Os diagramas devem se de alto nível. Não é necessário detalhar extensivamente cada diagrama ou processo.**

### 3. Visão de Produto: Resumo de Produto

* **O Que o Sistema Faz (Detalhado):** 
    - Descreva em detalhes as funcionalidades principais do sistema. 
    - Quais tarefas ou ações os usuários podem realizar?

* **Para Quem é o Sistema (Usuários/Clientes):** 
    - Identifique o público-alvo principal deste sistema. 
    - Quem são os usuários finais ou os clientes que se beneficiam dele?

* **Quais Problemas Ele Resolve (Necessidades Atendidas):** 
    - Quais problemas específicos este sistema ajuda a resolver para seus usuários ou para a organização? 
    - Quais necessidades ele atende?

* **Casos de Uso/Jornadas do Usuário (Alto Nível):**
    - Quais são os principais casos de uso desse sistema?
    - Como os usuários interagem com o sistema para atingir seus objetivos?

* **Funcionalidades Principais:** 
    - Liste as funcionalidades mais importantes do sistema de forma clara e concisa.

* **Domínios de Negócio:** 
    - Identifique os principais domínios de negócio que o sistema abrange (ex: vendas, estoque, finanças, etc.).

### 4. Limitação da Análise

- Quais foram as principais limitações que você encontrou ao analisar este código?
- Descreva resumidamente, o que limitou a sua análise do código?
- Descreva sugestões para diminuir ou eliminar essa limitação.

## Formato do Documento

O documento deve ser formatado em Markdown, com títulos e subtítulos claros para cada seção. Utilize listas, tabelas e outros elementos de Markdown para facilitar a leitura e a compreensão das informações.

## Instruções Adicionais

* Concentre-se em fornecer informações relevantes e de alto nível, evitando detalhes excessivos de implementação, a menos que sejam cruciais para a compreensão geral.
* Utilize uma linguagem clara, concisa e acessível para diferentes públicos.
* Seja o mais específico possível com base na sua análise do código.
* Gere a resposta completa como um **documento Markdown (`.md`) bem formatado**.
* Use **linguagem clara e direta**.
* Utilize **títulos e subtítulos** conforme os itens acima.

## Título e Resumo do Documento

* **Título do documento**: Análise Executiva e de Negócios da Aplicação - "Marketplace de Benefícios para Clientes PJ"
* **Resumo do documento**: 

Esse documento é o resultado da análise do código fonte do sistema Marketplace de Benefícios para Clientes PJ e engloba os seguintes pontos:

- **Visão de Nível Executivo:** Resumo do propósito da aplicação, como funciona em alto nível, regras de negócio principais e benefícios chave.
- **Visão de Nível Técnico:** Detalhamento da arquitetura do sistema, tecnologias utilizadas, fluxos principais, componentes-chave e diagramas (componentes, fluxo de dados, classes e implantação).
- **Visão de Produto:** Descrição detalhada do que o sistema faz, para quem é destinado, quais problemas resolve, casos de uso principais, funcionalidades e domínios de negócio.
- **Limitações da Análise:** Identificação das principais limitações encontradas durante a análise e sugestões para superá-las.

A análise foi baseada nos arquivos de código disponíveis na pasta `code/` e documentação de apoio.

## Critérios de Aceite do Documento
- [ ] Documento gerado segue template definido
- [ ] Todas as seções obrigatórias estão preenchidas
- [ ] Nomenclatura de arquivo está correta
- [ ] Documento está salvo na pasta `assets/documentos/`
- [ ] Linguagem é acessível para diferentes públicos
- [ ] Diagramas mermaid estão presentes e corretos
- [ ] Análise está baseada no código implementado

## Validação Pós-Execução
- [ ] Documento fornece visão clara do sistema para executivos
- [ ] Informações técnicas estão corretas e atualizadas
- [ ] Visão de produto está alinhada com os requisitos originais
- [ ] Limitações da análise estão documentadas
- [ ] Qualidade atende critérios mínimos definidos

## Ação

Por favor, analise o código-fonte atualmente disponível no ambiente/workspace e gere o documento Markdown conforme solicitado.

**IMPORTANTE**: O nome do arquivo deve ser `YYYY-MM-DD-HH-MM_documentacao_executiva.md` e deve ser salvo na pasta `assets/documentos/`
