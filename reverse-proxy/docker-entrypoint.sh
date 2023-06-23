#!/usr/bin/env sh
set -eu

envsubst '${KEYCLOAK_REALM}' < /etc/nginx/conf.d/app.location.template > /etc/nginx/conf.d/app.location
envsubst '${AUTH_URL}' < /etc/nginx/conf.d/auth.location.template > /etc/nginx/conf.d/auth.location
envsubst '${APP_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
envsubst '${APP_URL}' <  /etc/nginx/snippets/ssl-cert.conf.template > /etc/nginx/snippets/ssl-cert.conf

exec "$@"