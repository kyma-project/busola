#!/usr/bin/env bash

# Builds and runs busola using local nodejs

# standard bash error handling
set -o nounset  # treat unset variables as an error and exit immediately.
set -o errexit  # exit immediately when a command fails.
set -E          # needs to be set if we want the ERR trap
set -o pipefail # prevents errors in a pipeline from being masked

npm ci
npm run build
cp -r build backend/core-ui
cd backend
npm run build
IS_DOCKER=true npm run start:prod > busola.log &
export DOMAIN=http://localhost:3001
echo "waiting for server to be up..."
while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' "$DOMAIN")" != "200" ]]; do sleep 5; done
