#!/bin/bash

# standard bash error handling
set -o nounset  # treat unset variables as an error and exit immediately.
set -o errexit  # exit immediately when a command fails.
set -E          # needs to be set if we want the ERR trap
set -o pipefail # prevents errors in a pipeline from being masked

REPOSITORY=${REPOSITORY:-kyma-project/busola}
RELEASE_TAG=${RELEASE_TAG?"Release tag is not defined"}
RELEASE_ID=${RELEASE_ID?"Release id is not defined"}
echo "release tag ${RELEASE_TAG}"


uploadFile() {
  filePath=${1}
  ghAsset=${2}

  echo "Uploading ${filePath} as ${ghAsset}"
  response=$(curl -s -o output.txt -w "%{http_code}" \
                  --request POST --data-binary @"$filePath" \
                  -H "Authorization: token $GITHUB_TOKEN" \
                  -H "Content-Type: text/yaml" \
                   $ghAsset)
  if [[ "$response" != "201" ]]; then
    echo "Unable to upload the asset ($filePath): "
    echo "HTTP Status: $response"
    cat output.txt
    exit 1
  else
    echo "$filePath uploaded"
  fi
}

BUSOLA_K8S="busola.yaml"
generate_k8s() {
  set -x
  pwd
  ls -l
  cd resources
  (cd base/web && kustomize edit set image busola-web=europe-docker.pkg.dev/kyma-project/prod/busola-web:"${RELEASE_TAG}")
  (cd base/backend && kustomize edit set image busola-backend=europe-docker.pkg.dev/kyma-project/prod/busola-backend:"${RELEASE_TAG}")
  kustomize build base/ > ../"${BUSOLA_K8S}"
  cd -
  pwd
}

echo "Updating github release with assets"
UPLOAD_URL="https://uploads.github.com/repos/${REPOSITORY}/releases/${RELEASE_ID}/assets"


#DASHBOARD_K8S="kyma-dashboard.yaml"
#
#cat <<EOT >$DASHBOARD_K8S
#This is test release file
#create by to test empty release flow
#EOT


#uploadFile ${DASHBOARD_K8S} "${UPLOAD_URL}?name=${DASHBOARD_K8S}"

generate_k8s
uploadFile ${BUSOLA_K8S} "${UPLOAD_URL}?name=${BUSOLA_K8S}"
