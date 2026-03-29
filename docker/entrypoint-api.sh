#!/bin/sh
set -e
ROOT=/srv/agenciadev-api
cd "$ROOT"

verify_deps() {
  node -e "require('express'); require('pg');" 2>/dev/null
}

if ! verify_deps; then
  if [ ! -f package.json ]; then
    echo "agenciadev-api: sem package.json em $ROOT — volume a substituir a imagem."
    echo "  Remova o volume na raiz da API; mantenha só .../uploads."
    exit 1
  fi
  if [ ! -f package-lock.json ]; then
    echo "agenciadev-api: falta package-lock.json."
    exit 1
  fi
  echo "agenciadev-api: dependências inválidas ou incompletas; a limpar node_modules..."
  rm -rf node_modules
  echo "agenciadev-api: npm ci --omit=dev..."
  if ! env -u NODE_ENV npm ci --omit=dev; then
    echo "agenciadev-api: npm ci falhou; a tentar npm install --omit=dev..."
    rm -rf node_modules
    env -u NODE_ENV npm install --omit=dev --no-audit --no-fund
  fi
fi

if ! verify_deps; then
  echo "agenciadev-api: express/pg ainda não carregam."
  echo "  Garanta package-lock.json completo no Git e contexto de build do Easypanel com o repo inteiro."
  exit 1
fi

exec node server/health.mjs
