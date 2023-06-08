FROM node:alpine as builder

ARG HTTP_PROXY
ENV HTTP_PROXY $HTTP_PROXY

ARG HTTPS_PROXY
ENV HTTPS_PROXY $HTTPS_PROXY

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL $VITE_API_BASE_URL

ARG VITE_LOGOUT_URL
ENV VITE_LOGOUT_URL $VITE_LOGOUT_URL

RUN apk update && apk add bash
WORKDIR /app
COPY . .
RUN yarn && yarn build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
ENTRYPOINT ["nginx", "-g", "daemon off;"]