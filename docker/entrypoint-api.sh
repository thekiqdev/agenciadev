#!/bin/sh
set -e
ROOT=/srv/agenciadev-api
cd "$ROOT"

# API (health.mjs) precisa de express; migrate.mjs precisa de pg — ambos em dependencies
has_core_deps() {
  [ -f "$ROOT/node_modules/express/package.json" ] &&
    [ -f "$ROOT/node_modules/pg/package.json" ]
}

if ! has_core_deps; then
  if [ ! -f package.json ]; then
    echo "agenciadev-api: sem package.json em $ROOT — um volume está a substituir a imagem inteira."
    echo "  Remova o volume montado na raiz da API; mantenha só .../uploads."
    exit 1
  fi
  if [ ! -f package-lock.json ]; then
    echo "agenciadev-api: falta package-lock.json (imagem incompleta ou volume errado)."
    exit 1
  fi
  echo "agenciadev-api: node_modules incompleto; a correr npm ci --omit=dev (rede necessária)..."
  env -u NODE_ENV npm ci --omit=dev
fi

if ! has_core_deps; then
  echo "agenciadev-api: após npm ci ainda faltam express ou pg. Verifique rede e permissões."
  exit 1
fi

exec node server/health.mjs
