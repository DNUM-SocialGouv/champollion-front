FROM nginx:stable-alpine
COPY reverse-proxy/conf/. /etc/nginx/conf.d
COPY reverse-proxy/snippets/. /etc/nginx/snippets
ENTRYPOINT ["nginx", "-g", "daemon off;"]