---
title: Install Kyma Dashboard manually
---

To run Kyma Dashboard manually on a cluster, you must install it together with Istio Ingress. Follow this document to learn how to do so.

## Prerequisites

- Export KUBECONFIG as an environment variable that points to the kubeconfig file.
- If you install Kyma Dashboard on a cluster other than the Kyma cluster, you must have [Istio configured](https://istio.io/latest/docs/setup/getting-started/). On Kyma clusters, Istio is already configured by default.

## Install Kyma Dashboard with Istio Ingress

1. Create a Namespace for Kyma Dashboard:
   ```bash
   kubectl create namespace {NAMESPACE_NAME}
   ```
   For example:
   ```bash
   kubectl create namespace busola
   ```
2. Go to the `resources` folder and run the `apply-resources-istio.sh` script that deploys Kyma Dashboard under the given domain along with the Services and configuration. When running the script, make sure to provide your domain and Namespace name:

   ```bash
   ./apply-resources-istio.sh {DOMAIN} {NAMESPACE_NAME}
   ```

   > **NOTE:** In the case of k3d, your domain must end with `.local.kyma.dev`.

   For example:

   ```bash
   ./apply-resources-istio.sh busola.local.kyma.dev busola
   ```

3. Wait a minute for the Dashboard to start.
4. The Dashboard is available under your domain (for example, `https://busola.local.kyma.dev/`).

## Enable TLS in the backend service

By default, the communication with the backend Pod is plain HTTP. Even when you use Istio Service Mesh, the last bit of communication between the Istio sidecar and the backend service stays plain HTTP.

If your use case needs TLS all the way into the backend Pod, enable it by providing a TLS certificate to the backend service, setting some environment variables and changing the deployment. Depending on your setup, you might have to use a valid TLS certificate (for example, if you are directly exposing the backend Pod without TLS termination in between). In this case, you might want to use cert-manager to handle your certificates, or provide a valid one here and manage it yourself.

1. Generate a TLS certificate and create a tls secret on your cluster.
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout tls.key -out tls.crt -subj "/CN=foo.bar.com"
   kubectl create secret tls busola-backend-tls --key="tls.key" --cert="tls.crt"
   ```
2. Mount your certificate into the backend Pod by modifying the `resources/backend/deployment.yaml` file as follows:

   ```yaml
   # [...]

   # spec.template.spec.containers[0]
   volumeMounts:
   - mountPath: /var/run/secrets/ssl/
      name: ssl
      readOnly: true

   # [...]

   # spec.template.spec
   volumes:
   - name: ssl
      secret:
      secretName: busola-backend-tls

   # [...]
   ```

3. Set the following environment variables on the backend Pod:

   ```yaml
   # [...]

   # spec.template.spec.containers[0]
   env:
   - name: "BUSOLA_SSL_ENABLED"
      value: "1"
   - name: "BUSOLA_SSL_KEY_FILE"
      value: "/var/run/secrets/ssl/tls.key"
   - name: "BUSOLA_SSL_CRT_FILE"
      value: "/var/run/secrets/ssl/tls.crt"

   # [...]
   ```

4. If you are using Istio Service Mesh, enable the `destinationrule-busola-backend.yaml` resource in `resources/istio/kustomization.yaml`.
5. Install Busola according to [Install Kyma Dashboard with Istio Ingress](#install-kyma-dashboard-with-istio-ingress).
