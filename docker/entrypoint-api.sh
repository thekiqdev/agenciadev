#!/bin/sh
set -e
ROOT=/srv/agenciadev-api
cd "$ROOT"

has_express() { [ -f "$ROOT/node_modules/express/package.json" ]; }

if ! has_express; then
  if [ ! -f package.json ]; then
    echo "agenciadev-api: sem package.json em $ROOT — um volume está a substituir a imagem inteira."
    echo "  Remova o volume montado na raiz da API; mantenha só .../uploads."
    exit 1
  fi
  if [ ! -f package-lock.json ]; then
    echo "agenciadev-api: falta package-lock.json (imagem incompleta ou volume errado)."
    exit 1
  fi
  echo "agenciadev-api: node_modules ausente; a correr npm ci --omit=dev (rede necessária)..."
  env -u NODE_ENV npm ci --omit=dev
fi

if ! has_express; then
  echo "agenciadev-api: npm ci não instalou express. Verifique rede e permissões de escrita."
  exit 1
fi

exec node server/health.mjs
