#!/bin/bash

# Script para iniciar a aplicação Analisador de Risco de Cliente PJ via CNPJ
# Autor: Desenvolvedor - Analisador de Risco
# Data: 2025-06-06

# Definir cores para melhor visualização
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para exibir mensagens de log
log() {
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Função para exibir avisos
warn() {
  echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] AVISO: $1${NC}"
}

# Função para exibir erros
error() {
  echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERRO: $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -d "./backend" ] || [ ! -d "./frontend" ]; then
  error "Este script deve ser executado no diretório principal da aplicação"
  error "Diretório atual: $(pwd)"
  error "Por favor, execute: cd /caminho/para/analisador-risco"
  exit 1
fi

# Criar diretório de logs se não existir
if [ ! -d "logs" ]; then
  log "Criando diretório de logs em $(pwd)/logs..."
  mkdir -p logs
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
  error "Node.js não encontrado"
  warn "Instalando Node.js..."
  
  # Adicionar repositório NodeSource
  curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
  
  # Instalar Node.js
  sudo apt-get install -y nodejs
  
  if ! command -v node &> /dev/null; then
    error "Falha ao instalar Node.js. Por favor, instale manualmente."
    exit 1
  fi
  
  log "Node.js instalado com sucesso"
fi

# Exibir versão do Node.js
NODE_VERSION=$(node --version)
log "Usando Node.js versão: $NODE_VERSION"

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
  error "npm não encontrado"
  warn "Instalando npm..."
  
  sudo apt-get install -y npm
  
  if ! command -v npm &> /dev/null; then
    error "Falha ao instalar npm. Por favor, instale manualmente."
    exit 1
  fi
  
  log "npm instalado com sucesso"
fi

# Exibir versão do npm
NPM_VERSION=$(npm --version)
log "Usando npm versão: $NPM_VERSION"

# Instalar dependências do backend
log "Instalando dependências do backend..."
cd backend
npm install

if [ $? -ne 0 ]; then
  error "Falha ao instalar dependências do backend"
  exit 1
fi

# Iniciar o servidor em background
log "Iniciando o servidor Node.js..."
nohup node server.js > ../logs/server.log 2>&1 &

# Salvar o PID do processo
echo $! > ../logs/server.pid
log "Servidor iniciado com PID: $(cat ../logs/server.pid)"

# Voltar ao diretório principal
cd ..

log "Aplicação iniciada com sucesso!"
log "Acesse http://localhost:3000 no seu navegador"
log "Para parar a aplicação, execute ./stop.sh"
