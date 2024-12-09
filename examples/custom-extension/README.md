# Set Up Your Custom Busola Extension

This example contains a basic custom extension, that queries all deployments of a selected namespace of your cluster, and additionally retrieves the current weather data for Munich, Germany from an external weather API.

To set up and deploy your own custom Busola extension, follow these steps.

### 1. Adjust Static HTML Content

Edit the `ui.html` file to define the static HTML content for your custom extension.

---

### 2. Configure Dynamic Components

Set up dynamic or behavioral components by modifying the custom element defined in the `script.js` file.

- **Accessing Kubernetes Resources**: Use the `fetchWrapper` function to interact with cluster resources through the Kubernetes API.

- **Making External API Requests**: Use the `proxyFetch` function to handle requests to external APIs that are subject to CORS regulations.

---

### 3. Define Extension Metadata

Update the `general.yaml` file to define metadata for your custom extension.

#### ⚠️ Important:

Ensure that the `general.customElement` property matches the name of the custom element defined in `script.js`. The script is loaded only once, and this property is used to determine whether the custom element is already defined.

---

### 4. Deploy Your Extension

Before running the deployment command, ensure that your **Kubeconfig** is correctly exported and points to the desired cluster. You can check the current context by running:

```bash
kubectl config current-context
```

Run `./deploy-custom-extension.sh` to create a ConfigMap and deploy it to your cluster

Alternatively, you can use the following command:

```bash
kubectl kustomize . | kubectl apply -n kyma-system -f -
```

---

### 5. Test Your Changes Locally

Run `npm start` to start the development server.
