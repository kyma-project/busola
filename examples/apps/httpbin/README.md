# httpbin

[httpbin](https://httpbin.org/) is a HTTP request and response service. This example contains a Deployment and Service, along with reasonable quotas and limits.

## Contents

- `all.yaml` - a Namespace, LimitRange, ResourceQuota, Deployment and Service. Deploy with:

  ```bash
  kubectl create namespace httpbin && kubectl apply -f all.yaml
  ```

- `apirule.yaml` - optional APIRule. Deploy with:

  ```bash
  kubectl apply -f apirule.yaml
  ```

  The APIRule-exposed httpbin will be available at `httpbin.<YOUR_CLUSTER_DOMAIN>`.
