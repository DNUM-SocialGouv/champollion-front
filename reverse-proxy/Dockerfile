FROM nginx:stable-alpine
COPY conf/. /etc/nginx/conf.d
COPY snippets/. /etc/nginx/snippets
COPY ./docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]



