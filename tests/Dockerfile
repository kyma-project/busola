FROM cypress/included:7.1.0

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
LABEL source git@github.com:kyma-project/busola.git
COPY . .
