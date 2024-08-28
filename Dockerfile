# ---- Base Alpine with Node ----
FROM alpine:3.20.2 AS builder
ARG default_tag

# Install global dependencies
RUN apk update && \
  apk upgrade && \
  apk add --no-cache make nodejs npm yq

WORKDIR /app

# Set env variables
ENV PRODUCTION true
ENV CI true

COPY . /app

RUN yq -i '.version = "${default_tag}"' public/version.yaml && \
  make resolve validate && \
  chown -R 101:0 /app/nginx

RUN npm run build:docker

# ---- Serve ----
FROM nginxinc/nginx-unprivileged:1.27-alpine
WORKDIR /app

# apps
COPY --from=builder /app/build /app/core-ui

# nginx
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/
COPY --from=builder /app/nginx/mime.types /etc/nginx/

RUN ls -lha /etc/nginx

EXPOSE 8080
ENTRYPOINT ["nginx", "-g", "daemon off;"]
