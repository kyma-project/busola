---
title: Cannot connect to cluster
---

## Symptom

<!-- Describe the problem from the user's perspective. Provide the undesirable condition or symptom that the user may want to correct. This could be an error message or an undesirable state.
-->

When I connect to Kubernetes cluster by Busola, I get connection error.

## Cause

Connection problem can be caused by:

- Not correct kubeconfig
- Busola backend is not allowed to connect to cluster.

## Solution

1. Check correctness of provided kubeconfig using [kubectl](https://kubernetes.io/docs/reference/kubectl/) by executing any command.
2. Make sure that cluster can accept connection from Busola domain.
