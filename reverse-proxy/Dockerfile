FROM nginx:1.24-alpine-slim

ARG HTTP_PROXY APP_CERTIFICATE_FILE APP_CERTIFICATE_PASSWORD APP_URL
ENV HTTP_PROXY $HTTP_PROXY
ENV HTTPS_PROXY $HTTP_PROXY

ADD conf/. /etc/nginx/conf.d
ADD snippets/. /etc/nginx/snippets
ADD ./docker-entrypoint.sh /
ADD ./ssl/${APP_CERTIFICATE_FILE} /etc/ssl

RUN chmod +x /docker-entrypoint.sh && \ 
    apk upgrade --update-cache --available && \
    apk add openssl && \
    rm -rf /var/cache/apk/*

RUN mkdir -p /etc/ssl/private /etc/ssl/certs && \
    openssl pkcs12 -info -in /etc/ssl/${APP_CERTIFICATE_FILE} -out /etc/ssl/private/certificate.key -nodes -legacy -nocerts -password pass:${APP_CERTIFICATE_PASSWORD} && \
    openssl pkcs12 -info -in /etc/ssl/${APP_CERTIFICATE_FILE} -out /etc/ssl/certs/certificate.crt -nodes -legacy -nokeys -password pass:${APP_CERTIFICATE_PASSWORD} && \
    openssl dhparam -out /etc/ssl/certs/dhparam.pem 4096

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]