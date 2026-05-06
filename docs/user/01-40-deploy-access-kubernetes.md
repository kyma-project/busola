# Deploying and Accessing Busola in a Kubernetes Cluster

## Architecture

![Busola Kubernetes architecture](assets/busola_kubernetes_3.svg)

To expose Busola, you can use [APIRule](https://github.com/kyma-project/busola/tree/main/resources/istio), [Ingress](https://github.com/kyma-project/busola/tree/main/resources/ingress), or create your own exposing mechanism.
For more details about environment configuration, see [Environment-Specific Settings](../user/technical-reference/configuration.md#environment-specific-settings).

### Per-IP Rate Limiting

The shipped Ingress sets per-IP limits for `ingress-nginx`: 50 RPS sustained (~250 burst) and 50 concurrent connections per source IP. Tune in `resources/ingress/ingress.yaml`.

The annotations are nginx-specific and silently ignored by other controllers (Traefik, HAProxy, etc.) — for those, configure equivalent limits at your own edge. If you run ingress-nginx but it's not the cluster's default IngressClass, add `ingressClassName: nginx` to the Ingress so the annotations take effect.

For APIRule (Istio) deployments, per-IP rate limiting is not configured by default — APIRule v2alpha1 has no native rate-limit field. Configure an `EnvoyFilter` at your gateway, or rely on an upstream WAF.

## Deploying Busola in a Kubernetes Cluster

Follow these steps to deploy Busola in a Kubernetes cluster:

1. Set the **NAMESPACE** shell environment variable and create your namespace:

   ```bash
   export NAMESPACE={YOUR_NAMESPACE_NAME}
   kubectl create namespace ${NAMESPACE}
   ```

2. Choose one of the following installation options that suit your case.

<!-- tabs:start -->

#### **Install Busola from a release**

3. Go to the [Busola release page](https://github.com/kyma-project/busola/releases) and choose one of the available versions.

4. Set the **VERSION** environment variable:

   ```bash
   export VERSION={YOUR_BUSOLA_VERSION}
   ```

5. Run the following command to install Busola from the release you've chosen:

   ```bash
   kubectl apply --namespace "${NAMESPACE}" -f "https://github.com/kyma-project/busola/releases/download/${VERSION}/busola.yaml"
   ```

#### **Install Busola from the main branch**

3. Clone the [Busola repository](https://github.com/kyma-project/busola).
4. Go to the folder where you downloaded it and run:

   ```bash
   (cd resources && kustomize build base/ | kubectl apply --namespace "${NAMESPACE}" -f- )
   ```

#### **Install Busola with a specific landscape configuration**

3. Clone the [Busola repository](https://github.com/kyma-project/busola).

4. Set the **ENVIRONMENT** environment variable:

   ```bash
   export ENVIRONMENT={YOUR_LANDSCAPE}
   ```

5. Run the following command from the Busola root folder:

   ```bash
   (cd resources && kustomize build environments/${ENVIRONMENT} | kubectl apply --namespace "${NAMESPACE}" -f- )
   ```

#### **Install Busola from a pull request**

3. Clone the [Busola repository](https://github.com/kyma-project/busola).

4. Set your PR number as an environment variable:

   ```bash
   export PR_NUMBER={PR_NUMBER}
   ```

5. Run the following command from the Busola root folder:

   ```bash
   (cd resources/base && kustomize edit set image busola="europe-docker.pkg.dev/kyma-project/dev/busola-web:PR-${PR_NUMBER}" && cd ../ && kustomize build base/ | kubectl apply --namespace "${NAMESPACE}" -f- )
   ```

> [!NOTE]
> If there are any changes in your PR, the image should be automatically updated in your cluster. If you don't see the latest changes, make sure that the image job has finished. Then, go to your namespace, and in **Deployments**, select the restart button next to the image you want to update.

<!-- tabs:end -->

## Accessing Busola Installed in a Kubernetes Cluster

You can access Busola using the `kubectl port forward` command or your Kubernetes cluster with Istio installed.

### kubectl

Run the following command:

```bash
kubectl port-forward --namespace "${NAMESPACE}" services/busola 3001:3001
```

### Kubernetes Cluster with Istio Installed

#### Prerequisites

- Sidecar Proxy injection for your namespace enabled; see [Enable Istio Sidecar Proxy Injection](https://kyma-project.io/#/istio/user/tutorials/01-40-enable-sidecar-injection?id=enable-istio-sidecar-proxy-injection).
- The API Gateway and Istio modules installed, see [Quick Install](https://kyma-project.io/02-get-started/01-quick-install.html)

#### Procedure

Follow these steps to access your Busola page:

1. To install the Istio required resources, run the following command from the Busola root folder:

   ```bash
   (cd resources && kubectl apply --namespace "${NAMESPACE}" -k istio)
   ```

2. To get the Busola address, run:

   ```bash
   kubectl get --namespace "${NAMESPACE}" virtualservices.networking.istio.io
   ```

> [!NOTE]
> The VirtualService creation takes a few minutes.

Under `HOSTS`, you should see an address that you can use to access the Busola page.

## Logging into Busola

After accessing Busola using one of the methods above, you need to provide your kubeconfig to connect to it.

### Providing Kubeconfig

1. Open your web browser and navigate to one of the following:
   - `http://localhost:3001`, if using kubectl port-forward
   - The address from the Istio VirtualService

2. On the Busola login page, choose **Connect** to provide cluster connection details.
3. Provide your kubeconfig, either by uploading the kubeconfig file or by pasting the kubeconfig content in the text area, and select **Next Step**.
4. Choose your preferred storage configuration, and select **Next Step**.
5. Choose **Connect Cluster** to establish connection to your cluster.

After successful login, you should see the Busola dashboard with your cluster resources.
