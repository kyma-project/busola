# ---- Base Alpine with Node ----
FROM --platform=$BUILDPLATFORM  alpine:3.22.2 AS base
# install node
RUN apk add --update nodejs npm

# ---- Install ependencies ----
FROM --platform=$BUILDPLATFORM base AS build
WORKDIR /app
COPY . .
RUN npm ci

# build to a naked Javascript
RUN npm run build

# ---- Serve ----
FROM base AS release
WORKDIR /app
COPY --chown=65532:65532 --from=build /app/backend-production.js ./
COPY --chown=65532:65532 settings settings/
COPY --chown=65532:65532 environments environments/
COPY --chown=65532:65532 certs.pem certs.pem
COPY --chown=65532:65532 package* ./
RUN npm ci --only=production

USER 65532:65532

EXPOSE 3001
CMD [ "npm", "run", "start:prod" ]
