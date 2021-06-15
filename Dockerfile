# ---- Base Alpine with Node ----
FROM alpine:3.13.5 AS builder
RUN apk add --update nodejs npm

WORKDIR /app

# Install global dependencies
RUN apk update && \
  apk upgrade && \
  apk add --no-cache curl make

# Set env variables
ENV PRODUCTION true
ENV CI true

COPY . /app

RUN make resolve
RUN make lint
RUN make pull-licenses

RUN cd /app/core && make test && make build
RUN cd /app/service-catalog-ui && make test && make build
RUN cd /app/core-ui && make test && make build
RUN cd /app/backend && npm run build

# ---- Serve ----
FROM alpine:3.13 AS release
RUN apk add --update nodejs npm
WORKDIR /app

COPY --from=builder /app/core/src /app/core
COPY --from=builder /app/core-ui/build /app/core-ui
COPY --from=builder /app/service-catalog-ui/build /app/service-catalog-ui
COPY --from=builder /app/backend/backend-production.js /app/backend-production.js
COPY --from=builder /app/backend/package* /app
RUN npm ci --only=production

# COPY --from=builder /app/${app_name}/licenses/ /app/licenses/

EXPOSE 3001
ENV NODE_ENV production
CMD ["node", "backend-production.js"]
