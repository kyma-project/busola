#!/bin/bash

# Builds Kyma Dashbaord image

# standard bash error handling
set -o nounset  # treat unset variables as an error and exit immediately.
set -o errexit  # exit immediately when a command fails.
set -E          # needs to be set if we want the ERR trap
set -o pipefail # prevents errors in a pipeline from being masked

echo "Build local image"
docker build -t "${IMG}" -f Dockerfile .
