# Documentação do Esquema de Banco de Dados

Este documento descreve o esquema de banco de dados para o Marketplace de Benefícios para Clientes PJ.

## Modelos de Dados

### User
Armazena informações de usuário para todos os tipos de usuários.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único do usuário |
| email | String | Email do usuário (único) |
| password | String | Senha criptografada |
| role | Enum | Papel do usuário: USER, SUPPLIER, ADMIN |
| status | Enum | Status da conta: ACTIVE, INACTIVE, PENDING, REJECTED |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Data de última atualização |

Relacionamentos:
- Um usuário pode ter um perfil (Profile)
- Um usuário pode ter um perfil de cliente (ClientProfile)
- Um usuário pode ter um perfil de fornecedor (SupplierProfile)
- Um usuário pode ter vários tokens de atualização (RefreshToken)

### Profile
Informações pessoais do usuário.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único do perfil |
| userId | UUID | Referência ao usuário |
| firstName | String | Nome |
| lastName | String | Sobrenome |
| avatar | String | URL da imagem de avatar (opcional) |
| phone | String | Número de telefone (opcional) |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Data de última atualização |

Relacionamentos:
- Pertence a um usuário (User)

### ClientProfile
Perfil específico para clientes PJ.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único do perfil de cliente |
| userId | UUID | Referência ao usuário |
| companyName | String | Nome da empresa |
| cnpj | String | CNPJ da empresa (único) |
| segment | String | Segmento de atuação |
| size | Enum | Tamanho da empresa: MICRO, SMALL, MEDIUM, LARGE |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Data de última atualização |

Relacionamentos:
- Pertence a um usuário (User)
- Pode ter vários contratos (Contract)
- Pode ter várias avaliações de serviço (ServiceReview)

### SupplierProfile
Perfil específico para fornecedores de serviços.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único do perfil de fornecedor |
| userId | UUID | Referência ao usuário |
| companyName | String | Nome da empresa |
| cnpj | String | CNPJ da empresa (único) |
| description | String | Descrição da empresa |
| website | String | Website da empresa (opcional) |
| status | Enum | Status de aprovação: ACTIVE, INACTIVE, PENDING, REJECTED |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Data de última atualização |

Relacionamentos:
- Pertence a um usuário (User)
- Pode oferecer vários serviços (Service)

### RefreshToken
Tokens para renovação de sessão.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único do token |
| token | String | Valor do token (único) |
| userId | UUID | Referência ao usuário |
| expiresAt | DateTime | Data de expiração |
| createdAt | DateTime | Data de criação |

Relacionamentos:
- Pertence a um usuário (User)

### Category
Categorias de serviços.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único da categoria |
| name | String | Nome da categoria (único) |
| description | String | Descrição da categoria |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Data de última atualização |

Relacionamentos:
- Pode ter vários serviços (Service)

### Service
Serviços oferecidos pelos fornecedores.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único do serviço |
| supplierId | UUID | Referência ao perfil do fornecedor |
| categoryId | UUID | Referência à categoria |
| title | String | Título do serviço |
| description | String | Descrição detalhada do serviço |
| price | Float | Preço do serviço |
| priceType | Enum | Tipo de preço: FIXED, HOURLY, MONTHLY, YEARLY, CUSTOM |
| status | Enum | Status de aprovação: ACTIVE, INACTIVE, PENDING, REJECTED |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Data de última atualização |

Relacionamentos:
- Pertence a um fornecedor (SupplierProfile)
- Pertence a uma categoria (Category)
- Pode estar em vários contratos (Contract)
- Pode ter várias avaliações (ServiceReview)

### Contract
Contratos entre clientes e fornecedores.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único do contrato |
| clientId | UUID | Referência ao perfil do cliente |
| serviceId | UUID | Referência ao serviço |
| status | Enum | Status do contrato: PENDING, ACTIVE, COMPLETED, CANCELLED |
| startDate | DateTime | Data de início |
| endDate | DateTime | Data de término (opcional) |
| totalPrice | Float | Preço total do contrato |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Data de última atualização |

Relacionamentos:
- Pertence a um cliente (ClientProfile)
- Refere-se a um serviço (Service)

### ServiceReview
Avaliações de serviços pelos clientes.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único da avaliação |
| clientId | UUID | Referência ao perfil do cliente |
| serviceId | UUID | Referência ao serviço |
| rating | Integer | Avaliação (1-5) |
| comment | String | Comentário (opcional) |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Data de última atualização |

Relacionamentos:
- Feita por um cliente (ClientProfile)
- Refere-se a um serviço (Service)

## Enums

### Role
Papéis de usuário:
- USER: Cliente PJ
- SUPPLIER: Fornecedor de serviços
- ADMIN: Administrador da plataforma

### Status
Status gerais:
- ACTIVE: Ativo
- INACTIVE: Inativo
- PENDING: Pendente de aprovação
- REJECTED: Rejeitado

### CompanySize
Tamanhos de empresa:
- MICRO: Microempresa
- SMALL: Pequena empresa
- MEDIUM: Média empresa
- LARGE: Grande empresa

### PriceType
Tipos de preço:
- FIXED: Preço fixo
- HOURLY: Preço por hora
- MONTHLY: Preço mensal
- YEARLY: Preço anual
- CUSTOM: Preço personalizado

### ContractStatus
Status de contrato:
- PENDING: Pendente
- ACTIVE: Ativo
- COMPLETED: Concluído
- CANCELLED: Cancelado

## Índices e Constraints

- Chaves únicas: email do usuário, CNPJ de cliente/fornecedor, token de atualização
- Chaves estrangeiras: todas as relações entre tabelas são garantidas por chaves estrangeiras
- Cascata de exclusão: quando um usuário é excluído, seus perfis e tokens são excluídos automaticamente