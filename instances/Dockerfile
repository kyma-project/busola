FROM node:9.11.2-alpine as ui-generator
WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json config-overrides.js /app/
RUN npm install --no-optional

# Copy sources
COPY src /app/src
COPY public /app/public

# Set env variables 
ENV PRODUCTION true

# Test & Build
ENV CI true
RUN npm test
RUN npm run build

FROM nginx:1.13.12-alpine
LABEL source git@github.com:kyma-project/console.git

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=ui-generator /app/build var/public

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]