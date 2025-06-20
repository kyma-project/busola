# Deploy and Access Busola in the Kubernetes Cluster

## Deploy Busola in the Kubernetes Cluster

To install Busola from release in the Kubernetes cluster set `VERSION` shell environment variable with desired release and run:

```shell
kubectl apply -f https://github.com/kyma-project/busola/releases/download/${VERSION}/busola.yaml
```

To install Busola from main branch in the Kubernetes cluster, run:

```shell
(cd resources && kustomize build base/ | kubectl apply -f- )
```

To install Busola using a specific environment configuration, set the `ENVIRONMENT` shell environment variable and run:

```shell
(cd resources && kustomize build environments/${ENVIRONMENT} | kubectl apply -f- )
```

## Access Busola Installed on Kubernetes

### kubectl

The simplest method that always works is to use the capabilities of kubectl.

```shell
kubectl port-forward services/busola 3001:3001
```

### k3d

Prerequisites:

- K3d with exposed loadbalancer on port 80.
  > **TIP:** To create K3d with exposed load balancer run: `k3d cluster create -p "80:80@loadbalancer"`.
  > See [Exposing Services](https://k3d.io/v5.6.3/usage/exposing_services/) for more details.

1. Install Ingress resources:

```shell
(cd resources && kubectl apply -f ingress/ingress.yaml)
```

2. Visit `localhost`

#### Connect to the k3d Cluster with Busola Installed.

To connect to the same k3d cluster with Busola installed, download kubeconfig and change the cluster server address to `https://kubernetes.default.svc:443`.

Use shell to quickly process the file.

Prerequisites:

- [yq](https://mikefarah.gitbook.io/yq)

Set the `K3D_CLUSTER_NAME` shell environment variable to the name of your cluster and run:

```shell
k3d kubeconfig get ${K3D_CLUSTER_NAME} > k3d-kubeconfig.yaml
yq --inplace '.clusters[].cluster.server = "https://kubernetes.default.svc:443"' k3d-kubeconfig.yaml
```

### Kubernetes Cluster with Istio Installed

Prerequisites:

- Sidecar Proxy injection enabled, see [Enable Istio Sidecar Proxy Injection](https://kyma-project.io/#/istio/user/tutorials/01-40-enable-sidecar-injection?id=enable-istio-sidecar-proxy-injection).
- The API Gateway module installed, see [Quick Install](https://kyma-project.io/#/02-get-started/01-quick-install)

1. Install the Istio required resources:

```shell
(cd resources && kubectl apply -k istio)
```

2. To get the Busola address, run:

```shell
kubectl get virtualservices.networking.istio.io
```

and find the `busola-***` virtual service. Under `HOSTS,` there is an address where you can access the Busola page.
