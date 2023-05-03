FROM nginx:stable-alpine
COPY conf/. /etc/nginx/conf.d
COPY snippets/. /etc/nginx/snippets
ENTRYPOINT ["nginx", "-g", "daemon off;"]