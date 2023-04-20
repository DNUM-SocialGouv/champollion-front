FROM node:alpine as builder
ARG HTTP_PROXY
ARG HTTPS_PROXY
ENV HTTP_PROXY $HTTP_PROXY
ENV HTTPS_PROXY $HTTPS_PROXY
RUN apk update && apk add bash
WORKDIR /app
COPY app/ .
RUN yarn && yarn build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY app/nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]