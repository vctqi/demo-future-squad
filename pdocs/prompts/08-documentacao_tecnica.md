# Agent: Documentação Técnica - Guia do Desenvolvedor

## Contexto
Você é um especialista em análise de código responsável por criar documentação técnica detalhada para desenvolvedores. O objetivo é facilitar o onboarding de novos desenvolvedores no projeto **Marketplace de Benefícios para Clientes PJ**.

## Pré-requisitos
- [ ] Código implementado na pasta `code/`
- [ ] Documentação de desenvolvimento em `code/dev_action_log.md`
- [ ] Testes implementados (se disponíveis) em `code/automated_tests/`
- [ ] Configurações de deploy (se disponíveis) em `code/deploy/`
- [ ] Documentação executiva disponível em `assets/documentos/`
- [ ] Estrutura de diretórios criada pelo prompt 00-setup-inicial

## Objetivo
Analisar o código implementado e gerar documentação técnica completa, incluindo arquitetura, componentes, fluxos e guias de desenvolvimento.

## Instruções Detalhadas

Por favor, aborde os seguintes pontos:

### 1. Resumo do README/Arquivos de Instruções
* Procure por arquivos como `README.md`, `LEIAME.md`, `CONTRIBUTING.md`, ou documentos similares.
* Faça um resumo objetivo e detalhado dos trechos mais relevantes para um novo desenvolvedor: visão geral do projeto, como configurar e rodar o sistema localmente, padrões adotados e instruções de contribuição (se houver).

### 2. Stack Tecnológica Detalhada
* Identifique e liste a stack tecnológica completa utilizada:
    * Linguagem(ns) de programação (incluindo versões, se detectáveis em arquivos como `package.json`, `pom.xml`, `.tool-versions`, `requirements.txt`, `build.gradle`, etc.).
    * Frameworks principais (backend, frontend, etc. Ex: Spring Boot, .NET, React, Angular, Vue, Django, Rails).
    * Banco(s) de dados (Tipo: SQL/NoSQL, Nome: PostgreSQL, MongoDB, etc.).
    * Arquitetura principal (Ex: Monolito, Microserviços, Serverless, MVC, MVVM, Clean Architecture).
    * Plataforma de Cloud (se identificável por SDKs ou configurações - AWS, Azure, GCP).
    * Ferramentas de build, gerenciadores de pacotes (Maven, Gradle, npm, yarn, pip).
    * Qualquer outra tecnologia relevante (caching, message brokers, containerização - Docker, K8s).
- **Cite os arquivos de configuração que demonstram cada item, com links.**

### 3. Visão Geral e Propósito
* Descreva de forma clara o que o sistema faz e para quem.
* Quais problemas ele resolve?
* Enumere as funcionalidades centrais.
* Se possível, relacione com os domínios de negócio envolvidos.
* Descreva em alto nível as suas funcionalidades principais.

### 4. Estrutura do Projeto e Recomendações de Leitura
* **Ponto de Entrada:** Por onde devo começar a explorar o código? Quais são os arquivos ou módulos de entrada (entry points)? (Ex: `main.go`, `index.js`, `Program.cs`, `app.py`, `Application.java`). **Forneça links para esses arquivos.**
* **Organização Geral:** Explique a estrutura geral das pastas e arquivos. Quais são as convenções importantes? **Use exemplos de nomes de pastas/arquivos.**
* **Configuração:** Existe algum arquivo de configuração principal? (Ex: `config.yaml`, `.env`, `appsettings.json`). Quais configurações são cruciais? **Forneça links.**
* **Recomendação de Leitura:** Sugira uma ordem ou um conjunto de arquivos/módulos chave que eu deveria ler primeiro para entender os conceitos centrais do projeto mais rapidamente.

### 5. Componentes Chave
* Identifique e descreva os módulos, classes, funções ou serviços mais importantes/centrais.
* Quais são as responsabilidades de cada um?
* Descreva responsabilidades e interdependências.
* Para cada componente, adicione um trecho de código representativo e link para o local onde está implementado.
* **Forneça exemplos de código e/ou links diretos para as definições desses componentes.**

### 6. Fluxos de Execução e Dados
* Descreva os workflows ou processos de negócio mais comuns/críticos. (Ex: Processamento de pedido, autenticação de usuário, etc.).
* Como os dados fluem através do sistema? Onde e como são persistidos, lidos, modificados?
* **Se possível, ilustre com exemplos e forneça links para funções ou classes relevantes nesses fluxos.**
* **6.1 Visão Geral do Esquema do Banco de Dados (se aplicável):** Se for uma aplicação com uso intensivo de banco de dados, é possível identificar as principais entidades/tabelas/coleções e seus relacionamentos primários (talvez com base em modelos ORM, migrações ou arquivos de esquema)? Descreva brevemente.

### 7. Dependências e Integrações
* **Dependências:** Liste as principais bibliotecas, frameworks e SDKs externos utilizados. Explique brevemente a função de cada um no projeto. **Forneça links para onde são configurados ou mais utilizados, se aplicável.**
* **Integrações:** Identifique e explique as integrações com serviços externos, bancos de dados (além do principal, se houver), APIs de terceiros, message brokers, etc. Como a comunicação é feita? **Aponte os módulos/classes responsáveis por essas integrações e forneça links.**
* **7.1 Documentação de API (se for uma API):** Se o projeto expõe APIs, existe alguma evidência de ferramentas ou padrões para documentação de API (ex: Swagger/OpenAPI, Javadoc/Docstrings específicos para endpoints)? Onde encontrar essa documentação ou como gerá-la?

### 8. Diagramas
- Gere diagramas macro sobre o sistema para visualizar a arquitetura e o funcionamento do sistema
- diagrama de componentes (focando nos principais módulos e suas interconexões)
- diagrama de fluxo de dados (mostrando o fluxo de informações através do sistema)
- diagrama de classes (apresentando as principais classes e seus relacionamentos, se aplicável à linguagem)
- diagrama de implantação simplificado (se informações forem detectáveis, mostrando onde os componentes são executados)
- diagrama de Implantação/Infraestrutura simplificado (se informações sobre a infraestrutura forem aparentes)
- **Crie os diagramas acima, no formato mermaid dentro do arquivo markdown. Os diagramas devem se de alto nível. Não é necessário detalhar extensivamente cada diagrama ou processo.**

### 9. Testes
* Existem testes automatizados (unitários, integração, E2E)? De quais tipos?
* Onde eles se encontram no projeto? 
* Qual framework de teste é utilizado?
* Como os testes são tipicamente executados?
* Como executar os testes localmente?
* Existe alguma estratégia de CI/CD que envolva testes?

### 10. Tratamento de Erros e Logging
* Como a aplicação geralmente lida com erros? Existe um padrão (ex: middleware global, exceções customizadas)?
* Qual biblioteca de logging é utilizada e há algum formato padrão?
* Existe integração com ferramentas de monitoramento (ex: Datadog, Sentry) visível no código?

### 11. Considerações de Segurança
* Existem mecanismos de segurança evidentes no código (ex: autenticação, autorização via middleware/filtros, validação de entrada)?
* Alguma biblioteca de segurança específica (ex: Spring Security, Passport.js, bibliotecas de JWT) é utilizada de forma proeminente?
* Há alguma prática de segurança notável (ex: tratamento de segredos, proteção contra ataques comuns)?

### 12. Outras Observações Relevantes (incluindo Build/Deploy)
* Existem arquivos relacionados ao processo de **build ou deploy** (ex: `Dockerfile`, `docker-compose.yml`, scripts de build/deploy, arquivos de configuração de CI/CD como `.github/workflows/`, `.gitlab-ci.yml`)? Se sim, o que eles indicam sobre como a aplicação é construída e implantada?
* Existe algo mais que seja crucial ou útil para um novo desenvolvedor entender rapidamente? (Ex: Débito técnico conhecido mencionado em comentários, padrões de design específicos não usuais, convenções de codificação importantes, notas sobre performance, etc.).

## Formato da Resposta Final
* Gere a resposta completa como um **documento Markdown (`.md`) bem formatado**.
* Use **linguagem clara e direta**.
* Utilize **títulos e subtítulos** conforme os itens acima.
* **Incorpore exemplos de código relevantes** (trechos curtos) para ilustrar os pontos.
* **Inclua links clicáveis** para arquivos, funções, classes e definições sempre que mencionar um elemento específico do código (fundamental para a exploração).
* Estruture a resposta usando os títulos e subtítulos numerados acima para facilitar a leitura.
- Sempre que possível:
  - **Inclua links clicáveis para arquivos, funções, classes.**
  - **Mostre trechos curtos e representativos de código.**
  - **Use bullet points ou tabelas para listar elementos.**

## Critérios de Aceite do Documento
- [ ] Documento gerado segue template definido
- [ ] Todas as seções obrigatórias estão preenchidas
- [ ] Nomenclatura de arquivo está correta
- [ ] Documento está salvo na pasta `assets/documentos/`
- [ ] Links para arquivos e componentes estão funcionais
- [ ] Exemplos de código estão presentes e relevantes
- [ ] Diagramas mermaid estão corretos e informativos
- [ ] Instruções de setup e execução estão claras

## Validação Pós-Execução
- [ ] Documento facilita onboarding de novos desenvolvedores
- [ ] Informações técnicas estão corretas e atualizadas
- [ ] Estrutura do projeto está bem explicada
- [ ] Componentes chave estão identificados e documentados
- [ ] Qualidade atende critérios mínimos definidos

## Ação
Por favor, analise o código-fonte atualmente disponível no ambiente/workspace e gere o documento Markdown conforme solicitado.

**IMPORTANTE**: O nome do arquivo deve ser `YYYY-MM-DD-HH-MM_documentacao_tecnica.md` e deve ser salvo na pasta `assets/documentos/`
