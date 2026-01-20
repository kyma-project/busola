# Deploying and Accessing Busola in the Kubernetes Cluster

## Architecture

![Busola Kubernetes architecture](assets/busola_kubernetes_3.svg)

To expose Busola, you can use [APIRule](https://github.com/kyma-project/busola/tree/main/resources/istio), [Ingress](https://github.com/kyma-project/busola/tree/main/resources/ingress), or create your own exposing mechanism.
For more details about environment configuration, see [Environment-Specific Settings](../user/technical-reference/configuration.md#environment-specific-settings).

## Deploying Busola in the Kubernetes Cluster

To install Busola from the release in the Kubernetes cluster, set the **NAMESPACE** and **VERSION** shell environment variables with the desired release and run:

```shell
kubectl apply --namespace "${NAMESPACE}" -f https://github.com/kyma-project/busola/releases/download/${VERSION}/busola.yaml
```

To install Busola from the main branch in the Kubernetes cluster, run:

```shell
(cd resources && kustomize build base/ | kubectl apply --namespace "${NAMESPACE}" -f- )
```

To install Busola using a specific environment configuration, set the **ENVIRONMENT** shell environment variable and run:

```shell
(cd resources && kustomize build environments/${ENVIRONMENT} | kubectl apply --namespace "${NAMESPACE}" -f- )
```

## Accessing Busola Installed on Kubernetes

### kubectl

The simplest method that always works is to use the capabilities of kubectl.

```shell
kubectl port-forward --namespace "${NAMESPACE}" services/busola 3001:3001
```

### k3d

Prerequisites:

- k3d with exposed loadbalancer on port 80.
  > **TIP:** To create K3d with exposed load balancer run: `k3d cluster create -p "80:80@loadbalancer"`.
  > See [Exposing Services](https://k3d.io/v5.6.3/usage/exposing_services/) for more details.

1. Install Ingress resources:

```shell
(cd resources && kubectl apply --namespace "${NAMESPACE}" -f ingress/ingress.yaml)
```

2. Visit `localhost`.

#### Connecting to the k3d Cluster with Busola Installed

To connect to the same k3d cluster with Busola installed, download kubeconfig and change the cluster server address to `https://kubernetes.default.svc:443`.

Use shell to quickly process the file.

Prerequisites:

- [yq](https://mikefarah.gitbook.io/yq)

Set the **K3D_CLUSTER_NAME** shell environment variable to the name of your cluster and run:

```shell
k3d kubeconfig get ${K3D_CLUSTER_NAME} > k3d-kubeconfig.yaml
yq --inplace '.clusters[].cluster.server = "https://kubernetes.default.svc:443"' k3d-kubeconfig.yaml
```

### Kubernetes Cluster with Istio Installed

Prerequisites:

- Sidecar Proxy injection enabled; see [Enable Istio Sidecar Proxy Injection](https://kyma-project.io/#/istio/user/tutorials/01-40-enable-sidecar-injection?id=enable-istio-sidecar-proxy-injection).
- The API Gateway module installed, see [Adding and Deleting a Kyma Module](https://help.sap.com/docs/btp/sap-business-technology-platform/enable-and-disable-kyma-module?locale=en-US&version=Cloud)

1. Install the Istio required resources:

```shell
(cd resources && kubectl apply --namespace "${NAMESPACE}" -k istio)
```

2. To get the Busola address, run:

```shell
kubectl get --namespace "${NAMESPACE}" virtualservices.networking.istio.io
```

and find the `busola-***` virtual service. Under `HOSTS,` there is an address where you can access the Busola page.
