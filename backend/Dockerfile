# ---- Base Alpine with Node ----
FROM alpine:3.19.0 AS base
# install node
RUN apk add nodejs=16.20.2-r0 npm=8.10.0-r0 --repository http://dl-cdn.alpinelinux.org/alpine/v3.16/main && \
    apk add --update openssl nghttp2



# ---- Install ependencies ----
FROM base AS build
WORKDIR /app
COPY . .
RUN npm ci

# build to a naked Javascript
RUN npm run build



# ---- Serve ----
FROM base AS release
WORKDIR /app
COPY --from=build /app/backend-production.js ./
COPY settings settings/
COPY certs.pem certs.pem
COPY package* ./
RUN npm ci --only=production

EXPOSE 3001
CMD [ "npm", "run", "start:prod" ]
