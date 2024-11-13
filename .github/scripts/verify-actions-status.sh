#!/usr/bin/env bash

echo "Checking status of github actions for busola"

REF_NAME="${1:-"main"}"
REPOSITORY=${REPOSITORY:-kyma-project/busola}

STATUS_URL="https://api.github.com/repos/${REPOSITORY}/commits/${REF_NAME}/check-suites"

GET_STATUS_JQ_QUERY=".check_suites | \"\(.status)-\(.conclusion)\""
GET_COUNT_JQ_QUERY=".total_count"

response=`curl -s ${STATUS_URL}`

count=`echo $response | jq -r "${GET_COUNT_JQ_QUERY}"`
if [[ "$count" == "0" ]]; then
  echo "No actions to verify"
else
  fullstatus=`echo $response |  jq -r "${GET_STATUS_JQ_QUERY}"`
  if [[ "$fullstatus" == "completed-success" ]]; then
    echo "All actions succeeded"
  else
    echo "Actions failed or pending - Check github actions status"
    exit 1
  fi
fi
