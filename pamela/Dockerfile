# ---- Base Alpine with Node ----
FROM alpine:3.12 AS base
# install node
RUN apk add --update nodejs npm openssl nghttp2 --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main



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
COPY --from=build /app/pamela-production.js ./
COPY package* ./
RUN npm ci --only=production

EXPOSE 3001
CMD [ "npm", "start" ]
