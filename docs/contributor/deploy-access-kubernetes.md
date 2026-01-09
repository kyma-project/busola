# Deploying and Accessing Busola in the Kubernetes Cluster

## Architecture

![Busola Kubernetes architecture](assets/busola_kubernetes_3.svg)

To expose Busola, you can use [APIRule](https://github.com/kyma-project/busola/tree/main/resources/istio), [Ingress](https://github.com/kyma-project/busola/tree/main/resources/ingress), or create your own exposing mechanism.
For more details about environment configuration, see [Environment-Specific Settings](../operator/configuration.md#environment-specific-settings).

## Deploying Busola in the Kubernetes Cluster

Follow these steps to deploy Busola in the Kubernetes Cluster:

1. Go to the Busola release page and download the version of your choice.
2. Set the the **NAMESPACE** and **VERSION** shell environment variables. For example:

   ```bash
   export NAMESPACE={YOUR_NAMESPACE}
   export VERSION={YOUR_BUSOLA_VERSION}
   ```

3. Run the following command to install Busola from the release you've chosen:

   ```bash
   kubectl apply --namespace "${NAMESPACE}" -f https://github.com/kyma-project/busola/releases/download/${VERSION}/busola.yaml
   ```

To install Busola from the main branch in the Kubernetes cluster, go to the folder with your Busola release, and run:

```bash
(cd resources && kustomize build base/ | kubectl apply --namespace "${NAMESPACE}" -f- )
```

To install Busola using a specific landscape configuration, go to the folder with your Busola release, set the **ENVIRONMENT** shell environment variable with your landscape, and run:

```bash
(cd resources && kustomize build environments/${ENVIRONMENT} | kubectl apply --namespace "${NAMESPACE}" -f- )
```

## Deploying Busola From a Pull Request

1. Create a PR, and run the following pipelines:

- **Busola Web Build** - front-end changes
- **Busola Backend Build** - backend changes, if needed.

> [!TIP]
> You can mark your PR as ready for review or you can trigger the jobs manualy using the `/test JOB_NAME` comment.

2. In `resources/base/busola/deployment.yaml`, go to `spec.containers.image` and replace `busola` with `europe-docker.pkg.dev/kyma-project/dev/busola-web:PR-{PR_NUMBER}`

> [!NOTE]
> You don't need to push these changes. You only need them to run the script.

3. Create a namespace on your cluster, for example, `UI5`.

4. Export your kubeconfig:

   ```bash
   export KUBECONFIG={PATH_TO_KUBECONFIG}
   ```

> [!TIP]
> If you have a problem with your kubeconfig, for example, with the Gardener login, create Service Account with `cluster-admin` Cluster Role Binding, generate token for this Service Account and use it as kubeconfig.

5. In your terminal, run the following command to get your Cluster domain:

   ```bash
   kubectl get gateway -n kyma-system kyma-gateway \
        -o jsonpath='{.spec.servers[0].hosts[0]}'
   ```

6. Go to the `resources` folder, and run the `apply-resources-istio.sh` script

   ```bash
   ./apply-resources-istio.sh {NAMESAPCE_NAME}.{CLUSTER_DOMAIN} {NAMESPACE_NAME}
   ```

> [!NOTE]
> If you get the `line 12: envsubst: command not found` error, install gettext with `brew install gettext`. After that, re-run the script.

Your demo cluster is available under `{NAMESAPCE_NAME}.{CLUSTER_LINK}`, for example, `ui5.c-58184fc.stage.kyma.ondemand.com`

### Updating Image After PR Changes

Your image should be automatically updated on your cluster, but in case if you don't see the newest changes, follow these steps:

1. Go to your namespace where PR image is deployed.
2. Go to Deployments.
3. Click restart on image which you want to update.

## Accessing Busola Installed on Kubernetes

After you've installed Busola, You can access it using kubectl, k3d, or from your Cluster with Istio installed.

<!-- tabs:start -->

### **kubectl**

Run the following command:

```bash
kubectl port-forward --namespace "${NAMESPACE}" services/busola 3001:3001
```

### **k3d**

1. Create a k3d cluster with the exposed load balancer.

   ```bash
   k3d cluster create -p "80:80@loadbalancer"
   ```

> [!TIP]
> See [Exposing Services](https://k3d.io/v5.6.3/usage/exposing_services/) for more details.

2. Install Ingress resources:

   ```bash
   (cd resources && kubectl apply --namespace "${NAMESPACE}" -f ingress/ingress.yaml)
   ```

3. Go to your localhost.

#### Connecting to the k3d Cluster with Busola Installed

To connect to the same k3d cluster with Busola installed, download kubeconfig and change the cluster server address to `https://kubernetes.default.svc:443`.

Use shell to quickly process the file.

##### Prerequisites

- [yq](https://mikefarah.gitbook.io/yq)

Set the **K3D_CLUSTER_NAME** shell environment variable to the name of your cluster and run:

```shell
k3d kubeconfig get ${K3D_CLUSTER_NAME} > k3d-kubeconfig.yaml
yq --inplace '.clusters[].cluster.server = "https://kubernetes.default.svc:443"' k3d-kubeconfig.yaml
```

#### **Kubernetes Cluster with Istio Installed**

##### Prerequisites

- Sidecar Proxy injection enabled; see [Enable Istio Sidecar Proxy Injection](https://kyma-project.io/#/istio/user/tutorials/01-40-enable-sidecar-injection?id=enable-istio-sidecar-proxy-injection).
- The API Gateway module installed, see [Quick Install](https://kyma-project.io/02-get-started/01-quick-install.html)

##### Procedure

1. Install the Istio required resources:

   ```bash
   (cd resources && kubectl apply --namespace "${NAMESPACE}" -k istio)
   ```

2. To get the Busola address, run:

   ```bash
   kubectl get --namespace "${NAMESPACE}" virtualservices.networking.istio.io
   ```

3. Find the `busola-***` virtual service. Under `HOSTS` there is an address where you can access Busola.

<!-- tabs:end -->
