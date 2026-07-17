#!/usr/bin/env bash
set -euo pipefail

export GH_PAGER=cat

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <pr-number> [repo]"
  echo "  repo defaults to kyma-project/busola"
  exit 1
fi

PR=$1
REPO=${2:-kyma-project/busola}

branch=$(gh pr view "$PR" --repo "$REPO" --json headRefName --jq '.headRefName')
echo "Branch: $branch"

run_ids=$(gh run list --repo "$REPO" --branch "$branch" --json databaseId,status \
  --jq '[.[] | select(.status == "waiting") | .databaseId] | .[]')

if [[ -z "$run_ids" ]]; then
  echo "No waiting runs found."
  exit 0
fi

for run_id in $run_ids; do
  env_ids=$(gh api "repos/$REPO/actions/runs/$run_id/pending_deployments" \
    --jq '[.[].environment.id]')

  if [[ "$env_ids" == "[]" ]]; then
    continue
  fi

  name=$(gh run list --repo "$REPO" --json databaseId,name \
    --jq ".[] | select(.databaseId == $run_id) | .name")

  gh api "repos/$REPO/actions/runs/$run_id/pending_deployments" \
    -X POST --input - <<EOF > /dev/null
{"environment_ids":$env_ids,"state":"approved","comment":""}
EOF
  echo "Approved: $name (run $run_id)"
done
