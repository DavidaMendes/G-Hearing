# G-Hearing

Sistema de reconhecimento de música em vídeos usando IA para identificar timestamps e reconhecer músicas através da API audd.io.

## 🚀 Como rodar o projeto pela primeira vez

### Pré-requisitos
- [Docker](https://www.docker.com/get-started) instalado
- [Node.js](https://nodejs.org/) **versão 20** (obrigatório para Prisma 6.x)
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/)
- [FFmpeg](https://ffmpeg.org/download.html) instalado (para processamento de vídeo/áudio)
- [Python 3](https://www.python.org/downloads/) (versão 3.8 a 3.12)
- Bibliotecas Python: `numpy` e `pydub`

### ⚠️ Importante: Versão do Node.js
Este projeto **requer Node.js 20** devido à compatibilidade com Prisma 6.x. Se você estiver usando uma versão diferente:

```bash
# Instalar Node.js 20 usando nvm (recomendado)
nvm install 20
nvm use 20

# Verificar a versão
node --version  # Deve mostrar v20.x.x
```

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

### 3. Instale o FFmpeg
```bash
# macOS (usando Homebrew)
brew install ffmpeg

# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# Windows (usando Chocolatey)
choco install ffmpeg

# Ou baixe diretamente de: https://ffmpeg.org/download.html
```

### 4. Instale as dependências Python
```bash
# Instalar numpy e pydub
pip install numpy pydub

# Ou se preferir usar pip3
pip3 install numpy pydub
```

## 🎙️ Detecção de Música em Broadcast

O projeto usa um detector **otimizado para matérias jornalísticas** que detecta música de fundo mesmo com voz principal por cima.

### Características:
- ✅ Detecta música de fundo em reportagens
- ✅ Funciona com voz + música simultaneamente
- ✅ Sensibilidade configurável (low, medium, high)
- ✅ Análise harmônica + padrões rítmicos
- ✅ **Divide automaticamente segmentos > 15s** (limitação da API de reconhecimento)

### Testar manualmente:
```bash
cd server

# Sensibilidade média (padrão)
python3 music-detector-broadcast.py uploads/audio.wav

# Música muito baixa (sensibilidade alta)
python3 music-detector-broadcast.py uploads/audio.wav high
```

**Documentação completa**: `server/BROADCAST_MUSIC_DETECTION.md`

### 5. Configure o servidor (Backend)
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

### 6. Configure o cliente (Frontend)
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
REQUEST_TIMEOUT=1800000
AUDD_IO_TOKEN=SUA CHAVE
GEMINI_API_KEY=SUA CHAVE
```

### Configurações de timeout
- **REQUEST_TIMEOUT**: Timeout das requisições em milissegundos (padrão: 1800000 = 30 minutos)
- **Limite de arquivo**: 2GB máximo
- **Timeout do servidor**: 30 minutos

### Acesso ao banco local
- **Host**: localhost
- **Porta**: 5432
- **Database**: db_ghearing
- **Usuário**: ghearing
- **Senha**: password

## 🧪 Testando a API

### Documentação do servidor

A documentação do servidor pode ser acessada através da rota `http://localhost:3333/api-docs`

### Autenticar usuário padrão
```bash
curl -X POST http://localhost:3333/api/users/auth \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ghearing.com", "password": "senha"}'
```

### Processar vídeo e detectar música
```bash
curl -X POST http://localhost:3333/api/videos/process \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F "video=@/caminho/para/seu/video.mxf" \
  -F "title=Meu Vídeo Teste"
```

### Listar todos os vídeos
```bash
curl -X GET http://localhost:3333/api/videos \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
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
- ✅ Upload de vídeos (formato .mxf obrigatório)
- ✅ Separação de áudio de vídeos
- ✅ Reconhecimento de timestamps de música
- ✅ Recorte de áudio em partes
- ✅ Reconhecimento de músicas via audd.io
- ✅ Armazenamento de dados no banco

## 📋 Especificações técnicas

- **Formato de vídeo**: Apenas arquivos .mxf são aceitos
- **Tamanho máximo**: 2GB por arquivo
- **Autenticação**: JWT obrigatório para upload
- **Processamento**: Extração automática de áudio + detecção de música

## 🚨 Solução de problemas

### Erro de versão do Node.js
```bash
# Se aparecer erro de compatibilidade com Prisma
# Verifique sua versão do Node.js
node --version

# Se não for v20.x.x, instale Node.js 20
nvm install 20
nvm use 20

# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

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
