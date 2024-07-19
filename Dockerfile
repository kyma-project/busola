# ---- Base Alpine with Node ----
FROM alpine:3.20.1 AS builder
ARG TAG_default_tag

RUN apk add --update nodejs npm

WORKDIR /app

# Install global dependencies
RUN apk update && \
  apk upgrade && \
  apk add --no-cache make

# Set env variables
ENV PRODUCTION true
ENV CI true

COPY . /app

RUN sed -i "s/version: dev/version: ${TAG_default_tag}/" public/version.yaml && make resolve validate

RUN npm run build:docker

# ---- Serve ----
FROM nginxinc/nginx-unprivileged:1.25-alpine
WORKDIR /app

# apps
COPY --from=builder /app/build /app/core-ui

# nginx
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/
COPY --from=builder /app/nginx/mime.types /etc/nginx/

EXPOSE 8080
ENTRYPOINT ["nginx", "-g", "daemon off;"]
