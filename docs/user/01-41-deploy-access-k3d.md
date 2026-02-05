# Deploying and Accessing Busola in k3d

## Prerequisites

- You have downloaded the preferred [Busola release](https://github.com/kyma-project/busola/releases).
- You have installed [yq](https://mikefarah.gitbook.io/yq).
- You have installed [kubectl](https://kubernetes.io/docs/tasks/tools/).

## Procedure

1. Create a k3d cluster with the exposed load balancer.

   > [!TIP]
   > If you want to use Istio with your k3d cluster, run: `k3d cluster create --image rancher/k3s:v1.33.5-k3s1 -p '80:80@loadbalancer' -p '443:443@loadbalancer' --k3s-arg '--disable=traefik@server:*'`. For more information, see [k3d](https://istio.io/latest/es/docs/setup/platform-setup/k3d/).

   ```bash
   k3d cluster create -p "80:80@loadbalancer"
   ```

   > [!TIP]
   > For more information, see [Exposing Services](https://k3d.io/v5.6.3/usage/exposing_services/).

2. To deploy Busola in your k3d cluster, follow the steps described in [Deploying Busola in a Kubernetes Cluster](01-40-deploy-access-kubernetes.md#deploying-busola-in-a-kubernetes-cluster).

3. In your terminal, go to the Busola root folder and run the following command to install Ingress resources:

   ```bash
   (cd resources && kubectl apply --namespace "${NAMESPACE}" -f ingress/ingress.yaml)
   ```

4. Open your browser and go to localhost to verify that Busola is available.

5. Get the list of all available k3d clusters:

   ```bash
   k3d cluster list
   ```

6. To connect to the k3d cluster where Busola is installed, set the **K3D_CLUSTER_NAME** environment variable to your cluster name (usually `k3s-default`) and run:

   ```shell
   k3d kubeconfig get ${K3D_CLUSTER_NAME} > k3d-kubeconfig.yaml
   yq --inplace '.clusters[].cluster.server = "https://kubernetes.default.svc:443"' k3d-kubeconfig.yaml
   ```

You can now use the newly created `k3d-kubeconfig.yaml` file to connect to your Busola instance.
