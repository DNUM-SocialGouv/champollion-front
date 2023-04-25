FROM node:alpine as builder
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG VITE_API_BASE_URL
ENV HTTP_PROXY $HTTP_PROXY
ENV HTTPS_PROXY $HTTPS_PROXY
ENV VITE_API_BASE_URL $VITE_API_BASE_URL
RUN apk update && apk add bash
WORKDIR /app
COPY app/ .
RUN yarn && yarn build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY app/nginx.conf /etc/nginx/conf.d/default.conf
ENTRYPOINT ["nginx", "-g", "daemon off;"]