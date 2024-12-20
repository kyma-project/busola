#!/bin/bash

kubectl kustomize . > ./custom-ui.yaml
kubectl apply -f ./custom-ui.yaml -n kyma-system
