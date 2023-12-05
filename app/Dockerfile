FROM node:18.17-alpine as builder

ARG HTTP_PROXY VITE_API_BASE_URL VITE_LOGOUT_URL VITE_MATOMO_SITE_ID VITE_MATOMO_URL
ENV HTTP_PROXY $HTTP_PROXY
ENV HTTPS_PROXY $HTTP_PROXY
ENV VITE_API_BASE_URL $VITE_API_BASE_URL
ENV VITE_LOGOUT_URL $VITE_LOGOUT_URL
ENV VITE_MATOMO_SITE_ID $VITE_MATOMO_SITE_ID
ENV VITE_MATOMO_URL $VITE_MATOMO_URL

RUN apk update && apk add bash
WORKDIR /app
COPY . .
RUN yarn && yarn build

FROM nginx:1.24-alpine-slim

COPY --from=builder /app/dist /usr/share/nginx/html
COPY default.conf.template /etc/nginx/conf.d
COPY ./docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
