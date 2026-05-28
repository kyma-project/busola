#!/bin/bash
set -e
set -u
set -o pipefail

PR_NUMBER=${PR_NUMBER:?PR Number not provided}
PROJECT_NAME=${PROJECT_NAME:-kyma-project/busola}

PR_STATUS=$(gh pr checks --repo "${PROJECT_NAME}" "${PR_NUMBER}" --json name,link,state)

FAILED_JOBS=$(echo "${PR_STATUS}" | jq '[.[] | select(.state == "FAILURE")]')
FAILED_JOBS_COUNT=$(echo "${FAILED_JOBS}" | jq 'length')

if [[ "${FAILED_JOBS_COUNT}" -eq 0 ]]; then
  echo "No Jobs failed"
  exit 0
fi

TMP_DIR=$(mktemp --directory)
echo "${FAILED_JOBS}" | jq --compact-output '.[]' | while read -r job; do
  NAME=$(echo "${job}" | jq --raw-output .name)
  LINK=$(echo "${job}" | jq --raw-output .link)

  RUN_ID="${LINK#*/runs/}"
  RUN_ID="${RUN_ID%%/*}"
  JOB_ID="${LINK#*/job/}"

  echo "Fetching logs and artifacts for: Name: ${NAME} RUN: ${RUN_ID}, JOB: ${JOB_ID} to ${TMP_DIR}"
  mkdir -p "${TMP_DIR}"/"${NAME}/artifacts"
  gh run view --repo "${PROJECT_NAME}" "${RUN_ID}" --log-failed > "${TMP_DIR}"/"${NAME}"/"${RUN_ID}"-"${JOB_ID}".log
#  turn off error check
  gh run download --repo "${PROJECT_NAME}" "${RUN_ID}" --dir "${TMP_DIR}"/"${NAME}"/artifacts/ || true
done
echo $TMP_DIR
