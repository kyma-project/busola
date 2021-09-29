# ---- Base Alpine with Node ----
FROM alpine:3.13.6 AS builder
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

# ---- Serve ----
FROM alpine:3.14.2
WORKDIR /app

RUN apk --no-cache upgrade &&\
    apk --no-cache add nginx &&\
    apk add --update jq

# apps
COPY --from=builder /app/core/src /app/core
COPY --from=builder /app/core-ui/build /app/core-ui
COPY --from=builder /app/service-catalog-ui/build /app/service-catalog

# nginx
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/
COPY --from=builder /app/nginx/mime.types /etc/nginx/

RUN touch /var/run/nginx.pid && \
  chown -R nginx:nginx /var/run/nginx.pid

RUN jq '.config.features.INIT_PARAMS.isEnabled = true' core/assets/config/config.json >> core/assets/config/config_new.json
RUN mv -f core/assets/config/config_new.json core/assets/config/config.json

EXPOSE 8080
ENTRYPOINT ["nginx", "-g", "daemon off;"]
