#!/bin/sh
set -e
ROOT=/srv/agenciadev-api
if [ ! -f "$ROOT/node_modules/express/package.json" ]; then
  echo "agenciadev-api: falta node_modules (express) em $ROOT."
  echo "  - Remova volumes montados sobre a raiz da app; monte só a pasta de uploads."
  echo "  - Refaça o build da imagem (sem cache)."
  exit 1
fi
cd "$ROOT"
exec node server/health.mjs
