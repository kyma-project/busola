# ---- Base Alpine with Node ----
FROM --platform=$BUILDPLATFORM node:24.15-alpine3.23 AS builder
WORKDIR /app
COPY . .
RUN npm ci

# build to a naked Javascript
RUN npm run build

# ---- Serve ----
FROM node:24.15-alpine3.23

WORKDIR /app
COPY --chown=65532:65532 --from=builder /app/backend-production.js ./
COPY --chown=65532:65532 settings settings/
COPY --chown=65532:65532 environments environments/
COPY --chown=65532:65532 certs.pem certs.pem
COPY --chown=65532:65532 package* ./
RUN npm ci --only=production

USER 65532:65532

EXPOSE 3001
CMD [ "npm", "run", "start:prod" ]
