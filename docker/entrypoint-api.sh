#!/bin/sh
set -e
ROOT=/srv/agenciadev-api
IMAGE_MODULES=/opt/agenciadev-api-image/node_modules
cd "$ROOT"

if [ ! -f "$IMAGE_MODULES/express/package.json" ] || [ ! -f "$IMAGE_MODULES/pg/package.json" ]; then
  echo "agenciadev-api: imagem sem node_modules completo em $IMAGE_MODULES — refaça o build da imagem."
  exit 1
fi

# Volume pode trazer package.json incompleto e node_modules quebrado; ignoramos e usamos só o bundle da imagem
rm -rf "$ROOT/node_modules"
ln -sfn "$IMAGE_MODULES" "$ROOT/node_modules"

exec node server/health.mjs
