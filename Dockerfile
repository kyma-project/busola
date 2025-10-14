# this is a Dockerfile for single deployment app - both backend and frontends

# ---- Base Alpine with Node ----
FROM node:22.17-alpine3.22 AS builder
ARG default_tag
ARG tag

RUN apk update && \
  apk upgrade && \
  apk add --no-cache make yq

WORKDIR /app

# Install global dependencies

# Set env variables
ENV PRODUCTION=true
ENV CI=true

COPY . /app

# build arg `tag` is used because `default_tag` is used by image builder and it cannot be overwritten.
RUN export TAG=${tag:-$default_tag} &&  yq -i '.version = "'${TAG}'"' public/version.yaml && \
  make resolve validate

RUN npm run build:docker
RUN cd /app/backend && npm run build

# ---- Environments Configuration ----
FROM node:22.17-alpine3.22 AS configuration
WORKDIR /kyma

RUN apk add make

#Copy /kyma configuration into container to /kyma
COPY /kyma /kyma

RUN npm ci
RUN make prepare-configuration

# ---- Serve (FIPS Compliant Alpine) ----
FROM ghcr.io/nginx/alpine-fips AS release
WORKDIR /app

# Install dependencies, including nodejs and openssl
RUN apk --no-cache upgrade && \
  apk --no-cache --update add nginx nodejs npm yq openssl

# Set OpenSSL environment variables globally for the runtime
ENV OPENSSL_MODULES=/usr/lib/ossl-modules
ENV OPENSSL_CONF=/etc/ssl/fips/nodejs.cnf

# Set up OpenSSL FIPS configuration (identical to your backend Dockerfile)
RUN mkdir -p /etc/ssl/fips && \
    openssl fipsinstall -out /etc/ssl/fips/fipsmodule.cnf -module $OPENSSL_MODULES/fips.so

# Create OpenSSL configuration file for Node.js to load the FIPS provider. (identical to your backend Dockerfile)
RUN echo "nodejs_conf = nodejs_init" > $OPENSSL_CONF && \
    echo ".include /etc/ssl/fips/fipsmodule.cnf" >> $OPENSSL_CONF && \
    echo "" >> $OPENSSL_CONF && \
    echo "[nodejs_init]" >> $OPENSSL_CONF && \
    echo "providers = provider_sect" >> $OPENSSL_CONF && \
    echo "alg_section = algorithm_sect" >> $OPENSSL_CONF && \
    echo "" >> $OPENSSL_CONF && \
    echo "[provider_sect]" >> $OPENSSL_CONF && \
    echo "fips = fips_sect" >> $OPENSSL_CONF && \
    echo "default = default_sect" >> $OPENSSL_CONF && \
    echo "" >> $OPENSSL_CONF && \
    echo "[fips_sect]" >> $OPENSSL_CONF && \
    echo "activate = 1" >> $OPENSSL_CONF && \
    echo "" >> $OPENSSL_CONF && \
    echo "[default_sect]" >> $OPENSSL_CONF && \
    echo "activate = 1" >> $OPENSSL_CONF && \
    echo "" >> $OPENSSL_CONF && \
    echo "[algorithm_sect]" >> $OPENSSL_CONF && \
    echo "default_properties = fips=yes" >> $OPENSSL_CONF

COPY --chown=65532:65532 --from=builder /app/build /app/core-ui
COPY --chown=65532:65532 --from=builder /app/backend/backend-production.js /app/backend-production.js
COPY --chown=65532:65532 --from=builder /app/backend/certs.pem /app/certs.pem
COPY --chown=65532:65532 --from=builder /app/backend/package* /app/
COPY --chown=65532:65532 --from=builder /app/backend/settings/* /app/settings/
COPY --chown=65532:65532 --from=builder /app/backend/environments /app/environments
COPY --chown=65532:65532 --from=builder /app/start_node.sh /app/start_node.sh
COPY --chown=65532:65532 --from=configuration /kyma/build /app/core-ui/environments

RUN npm ci --only=production

# use sessionStorage as default
RUN yq eval -i '.config.defaultStorage = "sessionStorage"' core-ui/defaultConfig.yaml

USER 65532:65532

EXPOSE 3001
ENV NODE_ENV=production ADDRESS=0.0.0.0 IS_DOCKER=true ENVIRONMENT=""

ENTRYPOINT ["/app/start_node.sh"]
