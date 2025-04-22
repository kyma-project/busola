#!/bin/bash

# Runs Kyma dashboard docker image with desired ENV

# standard bash error handling
set -o nounset  # treat unset variables as an error and exit immediately.
set -o errexit  # exit immediately when a command fails.
set -E          # needs to be set if we want the ERR trap
set -o pipefail # prevents errors in a pipeline from being masked

#
echo "Running kyma-dashboard... with ${IMG} image"
docker run -d --rm --net=host --pid=host --name kyma-dashboard --env ENVIRONMENT="${ENV}" "${IMG}"

echo "waiting for server to be up..."
while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' "http://localhost:3001")" != "200" ]]; do sleep 5; done
sleep 10

ENV_RESPONSE=$(curl "http://localhost:3001/active.env")
echo $ENV_RESPONSE

ACTIVE_ENV=${ENV_RESPONSE/ENVIRONMENT=}
ACTIVE_ENV=$(echo "${ACTIVE_ENV}" | tr -d '\n')
echo "Active env: ${ACTIVE_ENV}"

if [ "$ENV" != "$ACTIVE_ENV" ]; then
  echo "Active env: ${ACTIVE_ENV} is not the same as desired: ${ENV}"
  exit 1
fi
echo "Active env matches the desired env"
