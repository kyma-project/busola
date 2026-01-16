# Deploying and Accessing Busola in a Kubernetes Cluster

## Architecture

![Busola Kubernetes architecture](assets/busola_kubernetes_3.svg)

To expose Busola, you can use [APIRule](https://github.com/kyma-project/busola/tree/main/resources/istio), [Ingress](https://github.com/kyma-project/busola/tree/main/resources/ingress), or create your own exposing mechanism.
For more details about environment configuration, see [Environment-Specific Settings](../operator/configuration.md#environment-specific-settings).

## Deploying Busola in a Kubernetes Cluster

Follow these steps to deploy Busola in a Kubernetes cluster:

1. Set the **NAMESPACE** shell environment variable, and create your namespace:

   ```bash
   export NAMESPACE={YOUR_NAMESPACE_NAME}
   kubectl create namespace ${NAMESPACE}
   ```

2. Choose one of the following installation options that suits your case.

<details>
<summary>Install Busola from a release</summary>

3. See [the Busola release page](https://github.com/kyma-project/busola/releases) and choose one of the available versions.

4. Set the **VERSION** environment variable:

   ```bash
   export VERSION={YOUR_BUSOLA_VERSION}
   ```

5. Run the following command to install Busola from the release you've chosen:

   ```bash
   kubectl apply --namespace "${NAMESPACE}" -f "https://github.com/kyma-project/busola/releases/download/${VERSION}/busola.yaml"
   ```

   </details>

<details>
<summary>Install Busola from the main branch </summary>

3. Clone the [Busola repository](https://github.com/kyma-project/busola).
4. Go to the folder where you downloaded it, and run:

   ```bash
   (cd resources && kustomize build base/ | kubectl apply --namespace "${NAMESPACE}" -f- )
   ```

   </details>

<details>
<summary>Install Busola with a specific landscape configuration</summary>

3. Clone the [Busola repository](https://github.com/kyma-project/busola).

4. Export the **ENVIRONMENT** environment variable:

   ```bash
   export ENVIRONMENT={YOUR_LANDSCAPE}
   ```

5. Run the following command from the Busola root folder:

   ```bash
   (cd resources && kustomize build environments/${ENVIRONMENT} | kubectl apply --namespace "${NAMESPACE}" -f- )
   ```

   </details>

<details>
<summary>Install Busola from a pull request</summary>

1. Clone the [Busola repository](https://github.com/kyma-project/busola).

2. Export your PR number as an environment variable:

   ```bash
   export PR_NUMBER={PR_NUMBER}
   ```

3. Run the following command from the Busola root folder:

   ```bash
   (cd resources/base && kustomize edit set image busola="europe-docker.pkg.dev/kyma-project/dev/busola-web:PR-${PR_NUMBER}" && cd ../ && kustomize build base/ | kubectl apply --namespace "${NAMESPACE}" -f- )
   ```

> [!NOTE]
> In case of any changes in your PR, the image should be automatically updated on your cluster. If you don't see the latest changes, make sure that the image job has finished, go to your namespace, and in **Deployments**, select the restart button next to the image you want to update.

</details>

## Accessing Busola Installed on Kubernetes

You can access Busola by simply using the `kubectl port forward` command, or by using your Kubernetes cluster with Istio installed.

### kubectl

Run the following command:

```bash
kubectl port-forward --namespace "${NAMESPACE}" services/busola 3001:3001
```

### Kubernetes Cluster with Istio Installed

#### Prerequisites

- Sidecar Proxy injection enabled; see [Enable Istio Sidecar Proxy Injection](https://kyma-project.io/#/istio/user/tutorials/01-40-enable-sidecar-injection?id=enable-istio-sidecar-proxy-injection).
- The [API Gateway module](https://kyma-project.io/external-content/api-gateway/docs/user/README.html) installed, see [Quick Install](https://kyma-project.io/02-get-started/01-quick-install.html)

#### Procedure

Follow these steps to get access to your Busola page:

1. To install the Istio required resources, run the following command from the Busola root folder:

   ```bash
   (cd resources && kubectl apply --namespace "${NAMESPACE}" -k istio)
   ```

2. To get the Busola address, run:

   ```bash
   kubectl get --namespace "${NAMESPACE}" virtualservices.networking.istio.io busola
   ```

Under `HOSTS`, you should see an address that you can use to access the Busola page.
