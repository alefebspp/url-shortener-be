# 🔗 URL Shortener Backend

Uma API REST moderna e performática para encurtamento de URLs, construída com TypeScript, Fastify e PostgreSQL. Este projeto oferece recursos avançados como aliases personalizados, expiração automática, limite de cliques e processamento assíncrono de métricas.

## ✨ Features

### Funcionalidades Principais

- **Encurtamento de URLs** - Criação de links curtos com códigos únicos gerados automaticamente
- **Alias Personalizado** - Permite criar links com códigos customizados (ex: `/meu-link`)
- **Expiração Automática** - Links podem ter data de expiração configurada
- **Limite de Cliques** - Controle de acesso através de limite máximo de cliques
- **Rastreamento de Cliques** - Contador de cliques em tempo real com cache Redis
- **Validação de URLs** - Validação rigorosa de URLs permitidas e bloqueio de URLs proibidas
- **Cache Inteligente** - Cache Redis para melhor performance em redirecionamentos
- **Processamento Assíncrono** - Worker com BullMQ para atualização de métricas em background
- **Documentação Swagger** - API totalmente documentada com OpenAPI/Swagger UI
- **Type Safety** - Validação de tipos em tempo de compilação e runtime com Zod

### Tecnologias

- **TypeScript** - Type safety e melhor experiência de desenvolvimento
- **Fastify** - Framework web rápido e de baixo overhead
- **Node.js** - Runtime environment
- **Drizzle ORM** - ORM TypeScript-first com type safety
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e fila de jobs
- **BullMQ** - Sistema de filas para processamento assíncrono
- **Zod** - Validação de schemas em runtime
- **Docker Compose** - Orquestração de serviços (PostgreSQL e Redis)
- **Vitest** - Framework de testes
- **tsup** - Build tool otimizado

## 🚀 Getting Started

### Pré-requisitos

- Node.js 18+ ou Bun
- Docker e Docker Compose (para PostgreSQL e Redis)
- npm ou yarn

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/url-shortener-be.git
cd url-shortener-be
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto:

```env
NODE_ENV=dev
SERVER_PORT=3000
REDIS_URL=redis://:redispassword@localhost:6379
DATABASE_URL=postgresql://postgres:password@localhost:5432/url-shortener
FORBIDDEN_URLS=malicious-site.com,spam.com
CORS_ORIGIN=http://localhost:3000
```

### Configuração do Banco de Dados

1. Inicie os serviços com Docker Compose:

```bash
npm run db:start
```

Ou para ver os logs:

```bash
npm run db:watch
```

2. Aplique o schema ao banco de dados:

```bash
npm run db:push
```

3. (Opcional) Abra o Drizzle Studio para visualizar o banco:

```bash
npm run db:studio
```

### Executando a Aplicação

#### Modo Desenvolvimento

Inicie o servidor em modo desenvolvimento:

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

#### Modo Produção

1. Compile o projeto:

```bash
npm run build
```

2. Inicie o servidor:

```bash
npm start
```

#### Worker (Processamento Assíncrono)

Em um terminal separado, inicie o worker para processar jobs de atualização de cliques:

```bash
npm run worker:dev
```

Ou em produção:

```bash
npm run worker
```

## 📚 Documentação da API

A documentação interativa da API está disponível através do Swagger UI:

```
http://localhost:3000/docs
```

### Endpoints Principais

#### Criar Link Curto

```http
POST /api/links
Content-Type: application/json

{
  "destination": "https://example.com",
  "customAlias": "meu-link", // opcional
  "title": "Meu Link", // opcional
  "expiresAt": "2024-12-31T23:59:59Z", // opcional
  "maxClicks": 100, // opcional
  "ownerId": 1 // opcional
}
```

**Resposta:**

```json
{
  "data": {
    "id": 1,
    "code": "meu-link",
    "destination": "https://example.com",
    "customAlias": "meu-link",
    "title": "Meu Link",
    "createdAt": "2024-01-01T00:00:00Z",
    "expiresAt": "2024-12-31T23:59:59Z",
    "maxClicks": 100,
    "clicks": 0,
    "ownerId": 1
  }
}
```

#### Redirecionar Link

```http
GET /api/links/redirect/:code
```

Redireciona para a URL de destino (301) e incrementa o contador de cliques.

## 🏗️ Estrutura do Projeto

```
url-shortener-be/
├── src/
│   ├── constants/          # Constantes da aplicação
│   ├── db/                 # Configuração e schemas do banco
│   │   └── schema/         # Schemas Drizzle ORM
│   ├── env/                # Validação de variáveis de ambiente
│   ├── errors/             # Classes de erro customizadas
│   ├── features/           # Features organizadas por domínio
│   │   └── short-link/     # Feature de links curtos
│   │       ├── repository/ # Camada de acesso a dados
│   │       ├── schemas.ts  # Schemas Zod para validação
│   │       ├── short-link.controller.ts
│   │       ├── short-link.service.ts
│   │       └── types.ts
│   ├── lib/                # Bibliotecas e utilitários
│   │   └── bullmq/         # Configuração de filas e workers
│   ├── middleware/         # Middlewares do Fastify
│   ├── routes/             # Definição de rotas
│   ├── index.ts            # Configuração do Fastify
│   ├── server.ts           # Entry point do servidor
│   └── work-runner.ts      # Entry point do worker
├── docker-compose.yml      # Configuração Docker (PostgreSQL + Redis)
├── drizzle.config.ts       # Configuração Drizzle
├── package.json
├── tsconfig.json
└── README.md
```

## 📜 Scripts Disponíveis

### Desenvolvimento

- `npm run dev` - Inicia o servidor em modo desenvolvimento com hot reload
- `npm run worker:dev` - Inicia o worker em modo desenvolvimento

### Build

- `npm run build` - Compila o projeto TypeScript
- `npm run compile` - Compila com Bun (bytecode)
- `npm run check-types` - Verifica tipos TypeScript

### Banco de Dados

- `npm run db:push` - Aplica mudanças do schema ao banco
- `npm run db:generate` - Gera migrations
- `npm run db:migrate` - Executa migrations
- `npm run db:studio` - Abre Drizzle Studio UI
- `npm run db:start` - Inicia PostgreSQL e Redis via Docker
- `npm run db:watch` - Inicia Docker com logs visíveis
- `npm run db:stop` - Para os containers Docker
- `npm run db:down` - Remove os containers Docker

### Produção

- `npm start` - Inicia o servidor em produção (executa `db:push` antes)
- `npm run worker` - Inicia o worker em produção

### Testes

- `npm test` - Executa testes com Vitest
- `npm run test:watch` - Executa testes em modo watch

## 🐳 Docker

O projeto inclui um `docker-compose.yml` configurado com:

- **PostgreSQL** - Banco de dados na porta 5432
- **Redis** - Cache e fila de jobs na porta 6379

Para iniciar os serviços:

```bash
npm run db:start
```

## 🔒 Variáveis de Ambiente

| Variável         | Descrição                                          | Obrigatório | Padrão |
| ---------------- | -------------------------------------------------- | ----------- | ------ |
| `NODE_ENV`       | Ambiente de execução (`dev`, `test`, `production`) | Não         | `dev`  |
| `SERVER_PORT`    | Porta do servidor                                  | Sim         | -      |
| `REDIS_URL`      | URL de conexão Redis                               | Sim         | -      |
| `DATABASE_URL`   | URL de conexão PostgreSQL                          | Sim         | -      |
| `FORBIDDEN_URLS` | URLs proibidas (separadas por vírgula)             | Não         | -      |
| `CORS_ORIGIN`    | Origem permitida para CORS                         | Não         | -      |

## 🧪 Testes

O projeto utiliza Vitest para testes. Execute os testes com:

```bash
npm test
```

## 📝 Validações e Regras de Negócio

- URLs devem começar com `http://` ou `https://`
- Aliases customizados podem conter apenas letras, números, `-` e `_`
- Aliases customizados têm limite de 30 caracteres
- Data de expiração deve ser no futuro
- Limite de cliques deve ser maior que 0
- Links expirados não podem ser acessados
- Links que atingiram o limite de cliques não podem ser acessados
- URLs na lista de proibidas são bloqueadas

## 🎯 Arquitetura

O projeto segue uma arquitetura limpa e modular:

- **Controller** - Lida com requisições HTTP
- **Service** - Contém a lógica de negócio
- **Repository** - Abstração de acesso a dados
- **Schemas** - Validação com Zod
- **Workers** - Processamento assíncrono com BullMQ
