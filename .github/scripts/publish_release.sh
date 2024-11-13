#!/usr/bin/env bash

# This script publishes a draft release

# standard bash error handling
set -o nounset  # treat unset variables as an error and exit immediately.
set -o errexit  # exit immediately when a command fails.
set -E          # needs to be set if we want the ERR trap
set -o pipefail # prevents errors in a pipeline from being masked

RELEASE_ID=$1
IS_LATEST_RELEASE=$2

REPOSITORY=${REPOSITORY:-kyma-project/busola}
GITHUB_URL=https://api.github.com/repos/${REPOSITORY}
GITHUB_AUTH_HEADER="Authorization: Bearer ${GITHUB_TOKEN}"

CURL_RESPONSE=$(curl -w "%{http_code}" -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "${GITHUB_AUTH_HEADER}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  ${GITHUB_URL}/releases/${RELEASE_ID} \
  -d '{"draft": false, "make_latest": '"$IS_LATEST_RELEASE"'}')

HTTP_CODE=$(tail -n1 <<< "${CURL_RESPONSE}")
if [[ "${HTTP_CODE}" != "200" ]]; then
  echo "${CURL_RESPONSE}"
  exit 1
fi
