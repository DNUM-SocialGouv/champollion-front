#!/usr/bin/env sh
set -eu

envsubst '${API_URL} ${KEYCLOAK_REALM}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"