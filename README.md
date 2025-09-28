# G-Hearing

Sistema de reconhecimento de música em vídeos usando IA para identificar timestamps e reconhecer músicas através da API audd.io.

## 🚀 Como rodar o projeto pela primeira vez

### Pré-requisitos
- [Docker](https://www.docker.com/get-started) instalado
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/)

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd G-Hearing
```

### 2. Configure o banco de dados
```bash
# Rode o Docker Compose para subir o PostgreSQL
docker-compose up -d

# Verifique se o container está rodando
docker-compose ps
```

### 3. Configure o servidor (Backend)
```bash
# Entre na pasta do servidor
cd server

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute as migrações do banco
npx prisma migrate deploy

# Gere o cliente Prisma
npx prisma generate

# Rode o servidor em modo desenvolvimento
npm run dev
```

### 4. Configure o cliente (Frontend)
```bash
# Em outro terminal, entre na pasta do cliente
cd client/interface

# Instale as dependências
npm install

# Rode o cliente em modo desenvolvimento
npm run dev
```

## 📋 Comandos úteis

### Banco de dados
```bash
# Ver status do banco
docker-compose ps

# Parar o banco
docker-compose down

# Ver logs do banco
docker-compose logs

# Resetar o banco (cuidado!)
npx prisma migrate reset
```

### Servidor
```bash
# Rodar em desenvolvimento
npm run dev

# Gerar cliente Prisma
npx prisma generate

# Aplicar migrações
npx prisma migrate deploy

# Ver banco no Prisma Studio
npx prisma studio
```

## 🔧 Configuração do ambiente

### Variáveis de ambiente (.env)
```env
DATABASE_URL="postgresql://ghearing:password@localhost:5432/db_ghearing?schema=public"
JWT_SECRET="seu-jwt-secret-aqui"
PORT=3333
```

### Acesso ao banco local
- **Host**: localhost
- **Porta**: 5432
- **Database**: db_ghearing
- **Usuário**: ghearing
- **Senha**: password

## 🧪 Testando a API

### Autenticar usuário padrão
```bash
curl -X POST http://localhost:3333/api/users/auth \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ghearing.com", "password": "senha"}'
```

### Health check
```bash
curl http://localhost:3333/health
```

## 📁 Estrutura do projeto

```
G-Hearing/
├── server/                 # Backend (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── controllers/    # Controllers
│   │   ├── services/       # Services
│   │   ├── routes/         # Rotas
│   │   └── generated/      # Cliente Prisma gerado
│   ├── prisma/            # Schema e migrações
│   └── package.json
├── client/                # Frontend (Next.js)
│   └── interface/
└── docker-compose.yml     # Configuração do PostgreSQL
```

## 🛠️ Tecnologias utilizadas

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Criptografia de senhas

### Frontend
- **Next.js** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers

## 📝 Funcionalidades

- ✅ Autenticação de usuários com JWT
- ✅ Upload de vídeos
- ✅ Separação de áudio de vídeos
- ✅ Reconhecimento de timestamps de música
- ✅ Recorte de áudio em partes
- ✅ Reconhecimento de músicas via audd.io
- ✅ Armazenamento de dados no banco

## 🚨 Solução de problemas

### Erro de conexão com banco
```bash
# Verifique se o Docker está rodando
docker-compose ps

# Reinicie o container
docker-compose restart
```

### Erro de migração
```bash
# Resetar e aplicar migrações
npx prisma migrate reset
npx prisma migrate deploy
```

### Erro de cliente Prisma
```bash
# Regenerar cliente
npx prisma generate
```