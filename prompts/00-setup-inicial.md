# Agent: Setup - Configuração Inicial do Projeto

## Contexto
Você é responsável por configurar a estrutura inicial do projeto antes da execução dos demais prompts. Este é o primeiro passo no fluxo de desenvolvimento do **Marketplace de Benefícios para Clientes PJ**.

## Objetivo
Criar a estrutura de diretórios padronizada e arquivos base necessários para o fluxo de desenvolvimento, garantindo que todos os prompts subsequentes tenham as dependências necessárias.

## Estrutura de Diretórios a ser Validada/Criada

```
demo-future-squad/
├── assets/
│   ├── templates/
│   ├── documentos/
│   └── template_doc_qa.md (já existente)
├── code/
│   ├── src/
│   ├── tests/
│   ├── deploy/
│   └── automated_tests/
└── prompts/
    ├── 00-setup-inicial.md
    ├── 01-po-product-requirements.md
    ├── 02-sa-product-architecture.md
    ├── 03-techlead-product-backlog.md
    ├── 04-dev-product-coding.md
    ├── 05-qa-automatated-tests.md
    ├── 06-sre-cicd.md
    ├── 07-documentacao_executiva.md
    ├── 08-documentacao_tecnica.md
    └── prompt_changes.md
```

## Arquivos Base a serem Criados

### 1. README.md Principal
Criar arquivo README.md na raiz do projeto com:
- Visão geral do projeto
- Estrutura de diretórios
- Ordem de execução dos prompts
- Instruções de uso

### 2. .gitignore
Criar arquivo .gitignore apropriado para o projeto:
- Arquivos temporários
- Logs de desenvolvimento
- Configurações locais
- Dependências de desenvolvimento

### 3. Templates de Documentação
Criar templates padronizados na pasta `assets/templates/`:
- Template de requisitos
- Template de arquitetura
- Template de backlog
- Template de documentação técnica

## Validações Obrigatórias

### Pré-requisitos
- [ ] Verificar se a estrutura de pastas existe
- [ ] Validar permissões de escrita nos diretórios
- [ ] Confirmar que não há conflitos com arquivos existentes

### Critérios de Aceite
- [ ] Todas as pastas da estrutura foram criadas
- [ ] README.md principal foi criado com conteúdo adequado
- [ ] .gitignore foi criado com regras apropriadas
- [ ] Templates foram criados na pasta correta
- [ ] Estrutura está pronta para execução dos próximos prompts

### Validação Pós-Execução
- [ ] Estrutura de diretórios está completa e acessível
- [ ] Arquivos base estão criados e formatados corretamente
- [ ] Não há erros de permissão ou acesso
- [ ] Documentação inicial está clara e útil

## Instruções de Execução

1. **Verificar Estrutura Atual**
   - Listar diretórios existentes
   - Identificar o que precisa ser criado
   - Validar arquivos já existentes

2. **Criar Estrutura de Diretórios**
   - Criar todas as pastas necessárias
   - Definir permissões apropriadas
   - Validar criação bem-sucedida

3. **Gerar Arquivos Base**
   - README.md com documentação inicial
   - .gitignore com regras apropriadas
   - Templates de documentação

4. **Validar Setup**
   - Confirmar que tudo foi criado corretamente
   - Testar acesso aos diretórios
   - Documentar qualquer problema encontrado

## Conteúdo do README.md Principal

```markdown
# Marketplace de Benefícios para Clientes PJ

## Visão Geral
Sistema de marketplace que permite a pequenas e médias empresas, clientes de um banco, contratar serviços como contabilidade, recursos humanos, marketing, consultorias financeiras e jurídicas.

## Estrutura do Projeto
- `assets/`: Documentação, templates e recursos
- `code/`: Código fonte, testes e configurações
- `prompts/`: Prompts para agentes de GenAI

## Fluxo de Desenvolvimento
1. **00-setup-inicial**: Configuração inicial do projeto
2. **01-po-product-requirements**: Definição de requisitos
3. **02-sa-product-architecture**: Arquitetura do sistema
4. **03-techlead-product-backlog**: Backlog de desenvolvimento
5. **04-dev-product-coding**: Implementação do código
6. **05-qa-automatated-tests**: Testes automatizados
7. **06-sre-cicd**: Deploy e CI/CD
8. **07-documentacao_executiva**: Documentação executiva
9. **08-documentacao_tecnica**: Documentação técnica

## Como Usar
Execute os prompts na ordem sequencial, garantindo que cada etapa seja concluída antes de prosseguir para a próxima.
```

## Conteúdo do .gitignore

```
# Logs
*.log
logs/
dev_action_log.md

# Dependências
node_modules/
__pycache__/
*.pyc
.env
.env.local

# Build
dist/
build/
target/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporários
*.tmp
*.temp
.cache/

# Documentos gerados
assets/documentos/*.md
!assets/documentos/README.md
```

## Observações Importantes

- Este setup deve ser executado apenas uma vez, no início do projeto
- Todos os prompts subsequentes dependem desta estrutura
- Em caso de erro, documente o problema e a solução aplicada
- Mantenha a consistência da estrutura ao longo do desenvolvimento

## Formato da Resposta

Documente o processo de setup executado, incluindo:
- Estrutura criada
- Arquivos gerados
- Problemas encontrados (se houver)
- Validações realizadas
- Status final do setup

O relatório deve ser salvo como: `setup_report.md` na pasta `assets/documentos/`
