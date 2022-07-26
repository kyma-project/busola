# whoami

This example can be used to deploy the [whoami](https://hub.docker.com/r/containous/whoami) - a simple request and response logging service, similar to [httpbin](./../httpbin/README.md).

## Deployment

- To deploy the basic version of application, use the following command:

  ```bash
  kubectl create namespace whoami && kubectl apply -f all.yaml
  ```

- To expose the application on your cluster, fill the `<DOMAIN>` in `virtualservice.yaml` and apply it with:

  ```bash
  kubectl apply -f virtualservice.yaml
  ```

  Note: [Istio](https://istio.io/) is required.
