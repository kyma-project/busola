#!/usr/bin/env bash

PREVIOUS_RELEASE=$2 # for testability

# standard bash error handling
set -o nounset  # treat unset variables as an error and exit immediately.
set -o errexit  # exit immediately when a command fails.
set -E          # needs to be set if we want the ERR trap
set -o pipefail # prevents errors in a pipeline from being masked

RELEASE_TAG=$1

REPOSITORY=${REPOSITORY:-kyma-project/docker-registry}
GITHUB_URL=https://api.github.com/repos/${REPOSITORY}
GITHUB_AUTH_HEADER="Authorization: token ${GITHUB_TOKEN}"
CHANGELOG_FILE="CHANGELOG.md"

if [ "${PREVIOUS_RELEASE}"  == "" ]
then
  PREVIOUS_RELEASE=$(git describe --tags --abbrev=0)
fi

echo "## What has changed" >> ${CHANGELOG_FILE}

git log ${PREVIOUS_RELEASE}..HEAD --pretty=tformat:"%h" --reverse | while read -r commit
do
    COMMIT_AUTHOR=$(curl -H "${GITHUB_AUTH_HEADER}" -sS "${GITHUB_URL}/commits/${commit}" | jq -r '.author.login')
    if [ "${COMMIT_AUTHOR}" != "kyma-bot" ]; then
      git show -s ${commit} --format="* %s by @${COMMIT_AUTHOR}" >> ${CHANGELOG_FILE}
    fi
done

NEW_CONTRIB=$$.new

join -v2 \
<(curl -H "${GITHUB_AUTH_HEADER}" -sS "${GITHUB_URL}/compare/$(git rev-list --max-parents=0 HEAD)...${PREVIOUS_RELEASE}" | jq -r '.commits[].author.login' | sort -u) \
<(curl -H "${GITHUB_AUTH_HEADER}" -sS "${GITHUB_URL}/compare/${PREVIOUS_RELEASE}...HEAD" | jq -r '.commits[].author.login' | sort -u) >${NEW_CONTRIB}

if [ -s ${NEW_CONTRIB} ]
then
  echo -e "\n## New contributors" >> ${CHANGELOG_FILE}
  while read -r user
  do
    REF_PR=$(grep "@${user}" ${CHANGELOG_FILE} | head -1 | grep -o " (#[0-9]\+)" || true)
    if [ -n "${REF_PR}" ] #reference found
    then
      REF_PR=" in ${REF_PR}"
    fi
    echo "* @${user} made first contribution${REF_PR}" >> ${CHANGELOG_FILE}
  done <${NEW_CONTRIB}
fi

echo -e "\n**Full changelog**: https://github.com/$REPOSITORY/compare/${PREVIOUS_RELEASE}...${RELEASE_TAG}" >> ${CHANGELOG_FILE}

# cleanup
rm ${NEW_CONTRIB} || echo "cleaned up"