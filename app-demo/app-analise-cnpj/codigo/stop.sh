#!/bin/bash

# Script para parar a aplicação Analisador de Risco de Cliente PJ via CNPJ
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

# Verificar se o arquivo PID existe
if [ ! -f "logs/server.pid" ]; then
  warn "Arquivo PID não encontrado. A aplicação pode não estar em execução."
  
  # Verificar se há processos node em execução
  NODE_PIDS=$(pgrep -f "node server.js")
  
  if [ -n "$NODE_PIDS" ]; then
    warn "Encontrados processos Node.js em execução: $NODE_PIDS"
    read -p "Deseja tentar finalizar esses processos? (s/n): " RESPOSTA
    
    if [[ "$RESPOSTA" =~ ^[Ss]$ ]]; then
      for PID in $NODE_PIDS; do
        kill -15 $PID 2>/dev/null
        log "Tentando finalizar processo com PID $PID"
      done
      
      # Aguardar um pouco para verificar se os processos foram finalizados
      sleep 2
      
      # Verificar novamente
      NODE_PIDS=$(pgrep -f "node server.js")
      if [ -n "$NODE_PIDS" ]; then
        warn "Alguns processos ainda estão em execução. Tentando forçar finalização..."
        for PID in $NODE_PIDS; do
          kill -9 $PID 2>/dev/null
          log "Forçando finalização do processo com PID $PID"
        done
      fi
      
      log "Processos Node.js finalizados"
    else
      warn "Operação cancelada pelo usuário"
    fi
  else
    log "Nenhum processo Node.js encontrado em execução"
  fi
  
  exit 0
fi

# Obter PID do servidor
SERVER_PID=$(cat logs/server.pid)

# Verificar se o processo existe
if ps -p $SERVER_PID > /dev/null; then
  log "Parando servidor com PID: $SERVER_PID"
  kill -15 $SERVER_PID
  
  # Aguardar um pouco para verificar se o processo foi finalizado
  sleep 2
  
  # Verificar novamente
  if ps -p $SERVER_PID > /dev/null; then
    warn "Processo não finalizado normalmente. Tentando forçar finalização..."
    kill -9 $SERVER_PID
    
    # Aguardar mais um pouco
    sleep 1
    
    if ps -p $SERVER_PID > /dev/null; then
      error "Não foi possível finalizar o processo"
      exit 1
    fi
  fi
  
  log "Servidor parado com sucesso"
else
  warn "Processo com PID $SERVER_PID não encontrado"
  warn "O servidor pode já estar parado"
fi

# Remover arquivo PID
rm -f logs/server.pid
log "Arquivo PID removido"

log "Aplicação parada com sucesso"
