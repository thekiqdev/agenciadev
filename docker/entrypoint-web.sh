#!/bin/sh
set -e
URL="${API_INTERNAL_URL:?Defina API_INTERNAL_URL (ex.: http://nome-do-servico-api:3005)}"
sed "s#__API_URL__#${URL}#g" /etc/nginx/templates/default.conf.in > /etc/nginx/conf.d/default.conf
exec nginx -g "daemon off;"
