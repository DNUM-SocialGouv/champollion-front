FROM node:alpine as builder
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG VITE_API_URL
ENV HTTP_PROXY $HTTP_PROXY
ENV HTTPS_PROXY $HTTPS_PROXY
ENV VITE_API_URL $VITE_API_URL
RUN apk update && apk add bash
WORKDIR /app
COPY app/ .
RUN yarn && yarn build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]