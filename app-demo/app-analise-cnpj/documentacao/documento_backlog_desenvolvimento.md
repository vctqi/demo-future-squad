# Documento de Backlog de Desenvolvimento: Analisador de Risco de Cliente PJ via CNPJ

## 1. Visão Geral do Projeto

O "Analisador de Risco de Cliente PJ via CNPJ" é uma ferramenta que permite aos usuários inserir o CNPJ de um cliente pessoa jurídica e receber uma análise simplificada de risco, baseada em dados públicos e critérios pré-definidos. O sistema consulta dados cadastrais via API pública, calcula um score de risco com base em critérios específicos e apresenta os resultados em um dashboard intuitivo.

A aplicação seguirá uma arquitetura cliente-servidor em três camadas (frontend, backend e banco de dados), utilizando React para o frontend, Node.js com Express para o backend e SQLite para o banco de dados.

## 2. Planejamento de Desenvolvimento

### 2.1 Divisão por Sprints

O desenvolvimento será organizado em 3 sprints:

**Sprint 1: Fundação e Infraestrutura**
- Configuração do ambiente de desenvolvimento
- Implementação da estrutura básica do frontend e backend
- Integração com a API de CNPJ
- Implementação do banco de dados

**Sprint 2: Funcionalidades Principais**
- Implementação da validação de CNPJ
- Desenvolvimento do cálculo de score
- Implementação do sistema de cache
- Criação do dashboard básico

**Sprint 3: Finalização e Refinamento**
- Implementação completa do dashboard de resultados
- Refinamento da interface do usuário
- Implementação de logs
- Testes e correções

### 2.2 Marcos (Milestones)

1. **MVP Básico (Final do Sprint 1)**
   - Sistema capaz de receber um CNPJ, consultar a API e exibir os dados brutos
   - Banco de dados implementado

2. **MVP Funcional (Final do Sprint 2)**
   - Sistema capaz de calcular o score de risco
   - Implementação do cache para consultas recentes
   - Dashboard básico funcionando

3. **Produto Final (Final do Sprint 3)**
   - Dashboard completo com todos os recursos visuais
   - Sistema de logs implementado
   - Aplicação totalmente testada e pronta para uso

## 3. Tarefas Técnicas por User Story

### Épico 1: Consulta de CNPJ e Análise de Risco

#### US-01: Entrada de CNPJ

**T01-01: Implementação do Formulário de Consulta**
- **Descrição**: Criar o componente de formulário para entrada do CNPJ.
- **Detalhes Técnicos**:
  - Criar componente React para o formulário
  - Implementar campo de texto com máscara para CNPJ (XX.XXX.XXX/YYYY-ZZ)
  - Adicionar botão "Analisar risco"
- **Dependências**: Nenhuma
- **Estimativa**: 4 horas
- **Recursos**: 1 Desenvolvedor Frontend (Junior/Pleno)

**T01-02: Implementação da Validação de CNPJ**
- **Descrição**: Implementar a validação do CNPJ inserido pelo usuário.
- **Detalhes Técnicos**:
  - Validar formato do CNPJ (14 dígitos)
  - Implementar algoritmo de validação dos dígitos verificadores
  - Exibir mensagens de erro apropriadas
- **Dependências**: T01-01
- **Estimativa**: 4 horas
- **Recursos**: 1 Desenvolvedor Frontend (Pleno)

**T01-03: Implementação do Endpoint de Recebimento de CNPJ no Backend**
- **Descrição**: Criar API endpoint no backend para receber o CNPJ do frontend.
- **Detalhes Técnicos**:
  - Criar rota POST /api/cnpj
  - Implementar validação do CNPJ recebido
  - Retornar mensagens de erro apropriadas
- **Dependências**: Nenhuma
- **Estimativa**: 3 horas
- **Recursos**: 1 Desenvolvedor Backend (Junior/Pleno)

#### US-02: Consulta de Dados via API

**T02-01: Implementação do Adaptador de API CNPJ**
- **Descrição**: Criar módulo adaptador para encapsular chamadas à API pública de CNPJ.
- **Detalhes Técnicos**:
  - Criar módulo de serviço para chamar a API externa
  - Implementar tratamento de respostas e erros
  - Transformar dados recebidos para o formato interno da aplicação
- **Dependências**: Nenhuma
- **Estimativa**: 6 horas
- **Recursos**: 1 Desenvolvedor Backend (Pleno)

**T02-02: Desenvolvimento do Indicador de Carregamento**
- **Descrição**: Implementar indicador visual durante consultas à API.
- **Detalhes Técnicos**:
  - Criar componente de loading para o frontend
  - Implementar lógica de exibição/ocultação durante chamadas assíncronas
- **Dependências**: T01-01
- **Estimativa**: 2 horas
- **Recursos**: 1 Desenvolvedor Frontend (Junior)

**T02-03: Implementação de Tratamento de Erros da API**
- **Descrição**: Implementar tratamento adequado para erros de comunicação com a API.
- **Detalhes Técnicos**:
  - Tratar erros HTTP (404, 500, etc.)
  - Implementar retry com backoff exponencial para falhas temporárias
  - Exibir mensagens amigáveis ao usuário
- **Dependências**: T02-01
- **Estimativa**: 4 horas
- **Recursos**: 1 Desenvolvedor Backend (Pleno)

#### US-03: Cálculo de Score de Risco

**T03-01: Implementação do Módulo de Cálculo de Score**
- **Descrição**: Desenvolver o módulo responsável pelo cálculo do score de risco.
- **Detalhes Técnicos**:
  - Implementar lógica de pontuação baseada nos critérios definidos
  - Classificar o risco com base no score total
  - Identificar sinais de alerta
- **Dependências**: T02-01
- **Estimativa**: 8 horas
- **Recursos**: 1 Desenvolvedor Backend (Pleno/Senior)

**T03-02: Desenvolvimento dos Testes Unitários para o Cálculo de Score**
- **Descrição**: Criar testes unitários para validar a lógica de cálculo de score.
- **Detalhes Técnicos**:
  - Implementar testes para cada critério de pontuação
  - Validar a classificação de risco para diferentes cenários
  - Testar identificação de sinais de alerta
- **Dependências**: T03-01
- **Estimativa**: 4 horas
- **Recursos**: 1 Desenvolvedor Backend (Pleno)

### Épico 2: Visualização de Resultados

#### US-04: Dashboard de Resultados

**T04-01: Implementação da Estrutura Base do Dashboard**
- **Descrição**: Criar a estrutura base do dashboard de resultados.
- **Detalhes Técnicos**:
  - Implementar layout responsivo do dashboard
  - Criar seções para dados cadastrais, classificação de risco e critérios
  - Adicionar logos da Febraban Tech 2025 e TQI nas posições corretas
- **Dependências**: Nenhuma
- **Estimativa**: 6 horas
- **Recursos**: 1 Desenvolvedor Frontend (Pleno)

**T04-02: Implementação da Exibição de Dados Cadastrais**
- **Descrição**: Desenvolver a seção de exibição dos dados cadastrais da empresa.
- **Detalhes Técnicos**:
  - Criar componentes para exibir razão social, CNPJ, situação cadastral, etc.
  - Formatar dados para melhor legibilidade
- **Dependências**: T04-01
- **Estimativa**: 4 horas
- **Recursos**: 1 Desenvolvedor Frontend (Junior/Pleno)

**T04-03: Implementação da Visualização de Classificação de Risco**
- **Descrição**: Desenvolver a seção de exibição da classificação de risco.
- **Detalhes Técnicos**:
  - Criar badge visual colorido (verde, amarelo, vermelho)
  - Implementar exibição do score e classificação textual
  - Destacar sinais de alerta identificados
- **Dependências**: T04-01
- **Estimativa**: 5 horas
- **Recursos**: 1 Desenvolvedor Frontend (Pleno)

**T04-04: Implementação da Exibição de Critérios Aplicados**
- **Descrição**: Desenvolver a seção de exibição dos critérios que impactaram o score.
- **Detalhes Técnicos**:
  - Criar componente para listar critérios e suas pontuações
  - Implementar visualização clara das pontuações positivas e negativas
- **Dependências**: T04-01
- **Estimativa**: 4 horas
- **Recursos**: 1 Desenvolvedor Frontend (Junior/Pleno)

**T04-05: Estilização do Dashboard com as Cores da TQI**
- **Descrição**: Aplicar estilos visuais seguindo as cores do logo da TQI.
- **Detalhes Técnicos**:
  - Aplicar paleta de cores da TQI em todos os componentes
  - Garantir consistência visual
  - Implementar transições e efeitos visuais
- **Dependências**: T04-01, T04-02, T04-03, T04-04
- **Estimativa**: 4 horas
- **Recursos**: 1 Desenvolvedor Frontend (Pleno)

**T04-06: Download dos Logos e Integração no Frontend**
- **Descrição**: Baixar e integrar os logos da Febraban Tech 2025 e da TQI.
- **Detalhes Técnicos**:
  - Baixar logo da Febraban Tech 2025 de https://noomis-files-hmg.s3.amazonaws.com/content/b40c3ad0-d2a2-11ef-8d45-a52f29b56f56.png
  - Baixar logo da TQI de https://tqi.com.br/wp-content/themes/tqi/assets/img/logo.svg
  - Armazenar localmente no diretório da aplicação
  - Integrar ao layout do dashboard
- **Dependências**: T04-01
- **Estimativa**: 2 horas
- **Recursos**: 1 Desenvolvedor Frontend (Junior)

### Épico 3: Gerenciamento de Histórico

#### US-05: Armazenamento de Consultas

**T05-01: Implementação do Modelo de Dados**
- **Descrição**: Criar estrutura do banco de dados SQLite.
- **Detalhes Técnicos**:
  - Criar tabelas 'consultas' e 'criterios_aplicados'
  - Implementar relacionamentos
  - Configurar índices para otimizar consultas
- **Dependências**: Nenhuma
- **Estimativa**: 4 horas
- **Recursos**: 1 Desenvolvedor Backend (Pleno)

**T05-02: Implementação do Repositório de Consultas**
- **Descrição**: Desenvolver módulo para persistir e recuperar consultas do banco de dados.
- **Detalhes Técnicos**:
  - Implementar métodos CRUD para consultas
  - Criar funções para busca por CNPJ e data
  - Implementar tratamento de erros de banco de dados
- **Dependências**: T05-01
- **Estimativa**: 5 horas
- **Recursos**: 1 Desenvolvedor Backend (Pleno)

**T05-03: Integração do Armazenamento com o Fluxo Principal**
- **Descrição**: Integrar o armazenamento de consultas ao fluxo principal da aplicação.
- **Detalhes Técnicos**:
  - Modificar o controlador para salvar consultas após processamento
  - Implementar confirmação visual de armazenamento
- **Dependências**: T05-02, T03-01
- **Estimativa**: 3 horas
- **Recursos**: 1 Desenvolvedor Backend (Pleno)

#### US-06: Cache de Consultas Recentes

**T06-01: Implementação do Serviço de Cache**
- **Descrição**: Desenvolver serviço para verificar e utilizar dados em cache.
- **Detalhes Técnicos**:
  - Implementar lógica para verificar consultas nas últimas 24 horas
  - Recuperar dados de consultas recentes do banco
  - Implementar flag para identificar dados de cache
- **Dependências**: T05-02
- **Estimativa**: 5 horas
- **Recursos**: 1 Desenvolvedor Backend (Pleno)

**T06-02: Integração do Cache no Controlador**
- **Descrição**: Integrar o serviço de cache ao controlador principal.
- **Detalhes Técnicos**:
  - Modificar o controlador para verificar cache antes de chamar a API
  - Implementar lógica de decisão entre cache e API
- **Dependências**: T06-01
- **Estimativa**: 3 horas
- **Recursos**: 1 Desenvolvedor Backend (Pleno)

**T06-03: Implementação da Visualização de Dados em Cache**
- **Descrição**: Implementar indicação visual para dados provenientes do cache.
- **Detalhes Técnicos**:
  - Criar componente para informar ao usuário sobre dados em cache
  - Exibir data e hora da consulta original
  - Adicionar opção para forçar nova consulta
- **Dependências**: T06-02, T04-01
- **Estimativa**: 4 horas
- **Recursos**: 1 Desenvolvedor Frontend (Junior/Pleno)

### Tarefas Adicionais

**T07-01: Implementação de Logging**
- **Descrição**: Implementar sistema de logs conforme especificado na arquitetura.
- **Detalhes Técnicos**:
  - Configurar biblioteca de logging (Winston)
  - Implementar logs para eventos principais
  - Configurar armazenamento de logs
- **Dependências**: Nenhuma
- **Estimativa**: 4 horas
- **Recursos**: 1 Desenvolvedor Backend (Pleno)

**T07-02: Criação dos Scripts de Automação**
- **Descrição**: Desenvolver scripts para iniciar e parar a aplicação.
- **Detalhes Técnicos**:
  - Criar script start.sh para verificar requisitos e iniciar a aplicação
  - Criar script stop.sh para parar a aplicação corretamente
- **Dependências**: Nenhuma
- **Estimativa**: 3 horas
- **Recursos**: 1 Desenvolvedor DevOps/Backend (Pleno)

**T07-03: Criação da Documentação (README.md)**
- **Descrição**: Criar documentação detalhada para configuração e execução do sistema.
- **Detalhes Técnicos**:
  - Documentar requisitos do sistema
  - Detalhar processo de instalação e configuração
  - Explicar execução e parada da aplicação
  - Documentar funcionalidades principais
- **Dependências**: T07-02
- **Estimativa**: 4 horas
- **Recursos**: 1 Desenvolvedor (Pleno)

## 4. Estimativa Total de Esforço

| Categoria               | Número de Tarefas | Horas Estimadas |
|-------------------------|-------------------|-----------------|
| Frontend                | 9                 | 35              |
| Backend                 | 10                | 45              |
| Documentação            | 1                 | 4               |
| DevOps                  | 1                 | 3               |
| **Total**               | **21**            | **87**          |

## 5. Dependências e Sequenciamento

```mermaid
graph TD
    subgraph "Épico 1: Consulta de CNPJ e Análise de Risco"
        T01_01["T01-01: Implementação do Formulário de Consulta"]
        T01_02["T01-02: Implementação da Validação de CNPJ"]
        T02_02["T02-02: Desenvolvimento do Indicador de Carregamento"]
        T02_01["T02-01: Implementação do Adaptador de API CNPJ"]
        T02_03["T02-03: Implementação de Tratamento de Erros da API"]
        T03_01["T03-01: Implementação do Módulo de Cálculo de Score"]
        T03_02["T03-02: Desenvolvimento dos Testes Unitários para o Cálculo de Score"]
        IntegracaoEpico1["Integração Épico 1"]

        T01_01 --> T01_02
        T01_01 --> T02_02
        T02_01 --> T02_03
        T02_03 --> T03_01
        T03_01 --> T03_02
        T01_02 --> IntegracaoEpico1
        T03_01 --> IntegracaoEpico1
    end

    subgraph "Épico 2: Visualização de Resultados"
        T04_01["T04-01: Implementação da Estrutura Base do Dashboard"]
        T04_02["T04-02: Implementação da Exibição de Dados Cadastrais"]
        T04_03["T04-03: Implementação da Visualização de Classificação de Risco"]
        T04_04["T04-04: Implementação da Exibição de Critérios Aplicados"]
        T04_06["T04-06: Download dos Logos e Integração no Frontend"]
        T04_05["T04-05: Estilização do Dashboard com as Cores da TQI"]
        IntegracaoEpico2["Integração Épico 2"]

        T04_01 --> T04_02
        T04_01 --> T04_03
        T04_01 --> T04_04
        T04_01 --> T04_06
        T04_06 --> T04_05
        T04_02 --> IntegracaoEpico2
        T04_03 --> IntegracaoEpico2
        T04_04 --> IntegracaoEpico2
        T04_05 --> IntegracaoEpico2
    end
    
    IntegracaoEpico1 --> IntegracaoEpico2

    subgraph "Épico 3: Gerenciamento de Histórico"
        T05_01["T05-01: Implementação do Modelo de Dados"]
        T05_02["T05-02: Implementação do Repositório de Consultas"]
        T05_03["T05-03: Integração do Armazenamento com o Fluxo Principal"]
        T06_01["T06-01: Implementação do Serviço de Cache"]
        T06_02["T06-02: Integração do Cache no Controlador"]
        T06_03["T06-03: Implementação da Visualização de Dados em Cache"]

        T05_01 --> T05_02
        T05_02 --> T05_03
        T05_02 --> T06_01
        T06_01 --> T06_02
        T06_02 --> T06_03
    end
    
    IntegracaoEpico2 --> T05_03

    subgraph "Tarefas Adicionais"
        T07_01["T07-01: Implementação de Logging"]
        T07_02["T07-02: Criação dos Scripts de Automação"]
        T07_03["T07-03: Criação da Documentação (README.md)"]
        
        T07_02 --> T07_03
    end
    
    IntegracaoEpico1 --> T07_01
    T05_03 --> T07_02
```

## 6. Recursos Necessários

- **Desenvolvedor Frontend Junior**: 1 (12 horas)
- **Desenvolvedor Frontend Pleno**: 1 (23 horas)
- **Desenvolvedor Backend Junior**: 1 (3 horas)
- **Desenvolvedor Backend Pleno**: 1 (42 horas)
- **Desenvolvedor Backend/DevOps Pleno**: 1 (3 horas)
- **Desenvolvedor Full-stack Pleno**: 1 (4 horas)

Total: 3-4 desenvolvedores (considerando compartilhamento de papéis)

## 7. Riscos e Mitigações

### 7.1 Riscos Técnicos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| API de CNPJ indisponível | Alto | Médio | Implementar cache robusto, retry com backoff exponencial, modo offline |
| Problemas de desempenho com SQLite | Médio | Baixo | Implementar índices, monitorar tamanho do banco, limitar histórico |
| Incompatibilidade de navegadores | Médio | Baixo | Testar em múltiplos navegadores, usar polyfills quando necessário |

### 7.2 Riscos de Projeto

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Atraso na entrega | Alto | Médio | Priorizar funcionalidades core, implementar em fases, monitorar progresso diariamente |
| Falta de clareza nos requisitos | Alto | Baixo | Validar entendimento com stakeholders, criar protótipos, revisar documentação |
| Indisponibilidade de recursos | Médio | Baixo | Planejar com folga, ter recursos alternativos, compartilhar conhecimento |

## 8. Plano de Entrega

### Sprint 1 (1 semana)
- T01-01, T01-02, T01-03: Implementação do formulário e validação de CNPJ
- T02-01, T02-02, T02-03: Integração com API de CNPJ
- T05-01, T05-02: Implementação do modelo de dados e repositório
- T07-01: Implementação de logging

### Sprint 2 (1 semana)
- T03-01, T03-02: Implementação do cálculo de score
- T04-01, T04-06: Estrutura base do dashboard e integração de logos
- T05-03: Integração do armazenamento com o fluxo principal
- T06-01, T06-02: Implementação do serviço de cache

### Sprint 3 (1 semana)
- T04-02, T04-03, T04-04, T04-05: Finalização do dashboard
- T06-03: Visualização de dados em cache
- T07-02, T07-03: Scripts de automação e documentação
- Testes e correções finais

## Conclusão

Este backlog de desenvolvimento detalha as tarefas necessárias para implementar o "Analisador de Risco de Cliente PJ via CNPJ" conforme especificado nos documentos de requisitos e arquitetura. O esforço total estimado é de 87 horas, distribuídas entre 21 tarefas que cobrem frontend, backend, armazenamento de dados e funcionalidades adicionais.

O plano de desenvolvimento está estruturado em 3 sprints, com marcos claros e dependências identificadas. A implementação seguirá a arquitetura definida, utilizando React para o frontend, Node.js com Express para o backend e SQLite para o banco de dados.

Com uma equipe de 3-4 desenvolvedores, o projeto pode ser concluído em aproximadamente 3 semanas, entregando uma aplicação totalmente funcional que atende a todos os requisitos especificados.
