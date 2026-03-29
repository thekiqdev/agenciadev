#!/bin/sh
set -e
if [ ! -f /app/node_modules/express/package.json ]; then
  echo "agenciadev-api: falta node_modules (express). Possíveis causas:"
  echo "  - Volume montado em /app inteiro (sobrescreve a imagem). Monte só /app/uploads."
  echo "  - Imagem antiga ou build incompleto. Refaça o build sem cache."
  exit 1
fi
exec node server/health.mjs
