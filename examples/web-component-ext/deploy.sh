#!/bin/bash

kubectl kustomize . > ./sm-ui.yaml
kubectl apply -f ./sm-ui.yaml -n kyma-system
