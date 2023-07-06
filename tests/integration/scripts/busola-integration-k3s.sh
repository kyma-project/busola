#!/bin/bash

                set -e
                export CYPRESS_DOMAIN=http://localhost:3000
                export NO_COLOR=1
                export KUBECONFIG="$GARDENER_KYMA_PROW_KUBECONFIG"

                cat <<EOF | kubectl create -f - --raw "/apis/core.gardener.cloud/v1beta1/namespaces/garden-kyma-prow/shoots/nkyma/adminkubeconfig" | jq -r ".status.kubeconfig" | base64 -d > "kubeconfig--kyma--nkyma.yaml"
                {
                    "apiVersion": "authentication.gardener.cloud/v1alpha1",
                    "kind": "AdminKubeconfigRequest",
                    "spec": {
                        "expirationSeconds": 10800
                    }
                }
                EOF
                
                cp kubeconfig--kyma--nkyma.yaml tests/integration/fixtures/kubeconfig.yaml
                k3d kubeconfig get k3d > tests/integration/fixtures/kubeconfig-k3s.yaml
                
                npm ci && npm run build
                npm i -g serve 
                serve -s build > $ARTIFACTS/busola.log &

                pushd backend
                npm start > $ARTIFACTS/backend.log &
                popd

                echo "waiting for server to be up..."
                while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' "$CYPRESS_DOMAIN")" != "200" ]]; do sleep 5; done
                sleep 10

                cd tests/integration
                npm ci && npm run "test:$SCOPE"