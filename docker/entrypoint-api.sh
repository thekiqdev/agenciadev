#!/bin/sh
set -e
ROOT=/srv/agenciadev-api
cd "$ROOT"

# Sem esconder stderr — útil para ver o erro real (ex.: pg incompleto)
verify_deps() {
  node -e "require('express'); require('pg');"
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
  env -u NODE_ENV npm ci --omit=dev || echo "agenciadev-api: npm ci terminou com erro (continua para npm install)."
fi

# npm ci pode devolver exit 0 com lockfile truncado (~316 pacotes) e árvore quebrada; npm install usa só package.json
if ! verify_deps; then
  echo "agenciadev-api: require(express|pg) falhou após npm ci — lockfile no disco pode estar incompleto."
  echo "agenciadev-api: a limpar node_modules e a correr npm install --omit=dev..."
  rm -rf node_modules
  env -u NODE_ENV npm install --omit=dev --no-audit --no-fund
fi

if ! verify_deps; then
  echo "agenciadev-api: express/pg ainda não carregam."
  exit 1
fi

exec node server/health.mjs
