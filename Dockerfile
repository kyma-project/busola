# this is a Dockerfile for single deployment app - both backend and frontend
FROM --platform=$BUILDPLATFORM node:24.13-alpine3.23 AS builder

ARG default_tag
ARG tag

RUN apk update && \
  apk upgrade && \
  apk add --no-cache make yq

COPY . /app
# ---- Frontend build ----
WORKDIR /app
RUN npm clean-install

RUN export TAG=${tag:-$default_tag} &&  yq -i '.version = "'${TAG}'"' public/version.yaml
# use sessionStorage as default
RUN yq eval -i '.config.defaultStorage = "sessionStorage"' public/defaultConfig.yaml

RUN npm run build:docker

# ---- Backend build ----
WORKDIR /app/backend
RUN npm clean-install
RUN npm run build

#Remove devDependencies
RUN npm prune --omit=dev

# ---- Environments Configuration ----
FROM --platform=$BUILDPLATFORM node:24.13-alpine3.23 AS configuration
WORKDIR /kyma

RUN apk add make

#Copy /kyma configuration into container to /kyma
COPY /kyma /kyma

RUN npm ci
RUN make prepare-configuration

# ---- Copy result ----
FROM node:24.13-alpine3.23
WORKDIR /app

COPY --chown=65532:65532 --from=builder /app/build /app/core-ui
COPY --chown=65532:65532 --from=builder /app/backend/node_modules /app/node_modules
COPY --chown=65532:65532 --from=builder /app/backend/backend-production.js /app/backend-production.js
COPY --chown=65532:65532 --from=builder /app/backend/certs.pem /app/certs.pem
COPY --chown=65532:65532 --from=builder /app/backend/settings/* /app/settings/
COPY --chown=65532:65532 --from=builder /app/backend/environments /app/environments
COPY --chown=65532:65532 --from=configuration /kyma/build /app/core-ui/environments

USER 65532:65532

EXPOSE 3001
ENV ADDRESS=0.0.0.0 IS_DOCKER=true ENVIRONMENT="" NODE_ENV=production

CMD ["backend-production.js"]
