# ---- Base Alpine with Node ----
FROM node:20.17-alpine3.20 AS builder
ARG default_tag

# Install global dependencies
RUN apk update && \
  apk upgrade && \
  apk add --no-cache make yq

WORKDIR /app

# Set env variables
ENV PRODUCTION true
ENV CI true

COPY . /app

RUN yq -i '.version = "'${default_tag}'"' public/version.yaml && \
  make resolve validate

RUN npm run build:docker

# ---- Serve ----
FROM nginxinc/nginx-unprivileged:1.27.1-alpine3.20
WORKDIR /app

# apps
COPY --from=builder /app/build /app/core-ui

# nginx
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/
COPY --from=builder /app/nginx/mime.types /etc/nginx/

#entrypoint
COPY --from=builder --chown=nginx /app/start_nginx.sh /app/start_nginx.sh

USER root:root
RUN chown -R nginx:root /etc/nginx /app/core-ui
USER nginx:nginx

EXPOSE 8080
ENTRYPOINT ["/app/start_nginx.sh"]
