FROM --platform=$BUILDPLATFORM node:22.20-alpine3.22 AS builder
#FROM node:22.20-alpine3.22 AS builder

ARG default_tag
ARG tag

WORKDIR /app

RUN apk update && \
  apk upgrade && \
  apk add --no-cache make yq

# ---- JavaScript build ----
# Set env variables
ENV PRODUCTION=true
ENV CI=true
#ENV NODE_ENV=production

COPY . /app

RUN export TAG=${tag:-$default_tag} &&  yq -i '.version = "'${TAG}'"' public/version.yaml
RUN npm ci

# use sessionStorage as default
RUN yq eval -i '.config.defaultStorage = "sessionStorage"' public/defaultConfig.yaml

RUN npm run build:docker
RUN cd /app/backend && npm run build
RUN cd /app/backend && npm ci --omit=dev

# ---- Environments Configuration ----
FROM --platform=$BUILDPLATFORM node:22.20-alpine3.22 AS configuration
WORKDIR /kyma

RUN apk add make

#Copy /kyma configuration into container to /kyma
COPY /kyma /kyma

RUN npm ci
RUN make prepare-configuration

# ---- Copy result ----
FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /app

COPY --chown=65532:65532 --from=builder /app/build /app/core-ui
COPY --chown=65532:65532 --from=builder /app/backend/node_modules /app/node_modules
COPY --chown=65532:65532 --from=builder /app/backend/backend-production.js /app/backend-production.js
COPY --chown=65532:65532 --from=builder /app/backend/certs.pem /app/certs.pem
COPY --chown=65532:65532 --from=builder /app/backend/settings/* /app/settings/
COPY --chown=65532:65532 --from=builder /app/backend/environments /app/environments
COPY --chown=65532:65532 --from=builder /app/start_node.sh /app/start_node.sh
COPY --chown=65532:65532 --from=configuration /kyma/build /app/core-ui/environments

USER 65532:65532

EXPOSE 3001
ENV ADDRESS=0.0.0.0 IS_DOCKER=true ENVIRONMENT=""

CMD ["backend-production.js"]
