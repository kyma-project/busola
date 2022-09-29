# Extensibility

## Overview

With Busola's extensibility feature, you can create a separate dedicated user interface (UI) page for your CustomResourceDefinition (CRD). It enables you to add navigation nodes, on cluster or Namespace level, and to configure your [UI display](display-section.md), for example, a resource list page, and details pages. You can also [create and edit forms](form-section.md).

For more information about extensibility in Busola, visit [Config Map for resource-based extensions](resources.md).

## CRD ConfigMap wizard

To automatically add the UI page for your CRD, follow these steps:

1.  In the **Cluster Details** view, go to **Configuration > Extensions**.
2.  Click **Create Extension +**, and select your resource from the list.
3.  Optionally, you can uncheck the UI elements that are not necessary.

> **NOTE:** The UI elements visible in this form are only suggestions. You can change the configuration later in your ConfigMap.

4.  Click **Create**.

## Create a custom CRD ConfigMap

To create your CRD ConfigMap, follow these steps:

1. Go to the `kube-public` Namespace and choose **Configuration > Config Maps**.

> **NOTE:** You can choose your Namespace, but the `kube-public` Namespace is recommended.

2. Click **Create Config Map +** and enter the name of your ConfigMap.
3. Under **Data**, add the required fields to define how to handle your CRD.
4. Go to the **Advanced** tab and in the **Labels** form enter `busola.io/extension` as a key, and `resource` as a value.

> **NOTE:** Do not overwrite the existing name label.

5. Click **Create**.

To see an exemplary configuration of the Busola extensibility feature, see the [Pizza example](examples/../../../examples/pizzas/README.md).

## Built-in extensions

While the users can provide extensions, Busola also uses the extensibility mechanism to create some of the default views. Those default extensions are always present, even if the `EXTENSIBILITY` feature is disabled.

### Embedding an extension in Busola

1. Place your extension ConfigMaps in the `extensions` directory. If your extensions are hosted externally, you can specify their URLs in the `extensions/extensions.json` file, for example:

   ```json
   [
     {
       "url": "https://raw.githubusercontent.com/kyma-project/busola/main/examples/pizzas/configuration/pizzas-configmap.yaml"
     }
   ]
   ```

and then use the `npm run prepare-extensions` command to download them into the `extensions` directory.

2. Run the `npm run pack-extensions` command. This will gather all the YAML files from `extensions` directory and merge them into:

- `core/src/assets/extensions/extensions.yaml` plain YAML file, which can be used during the local development. This file is a list of all extracted configurations, without the ConfigMap header.
- `resources/extensions-patch/builtin-resource-extensions.configmap.yaml`. This file is a ConfigMap with `extensions.yaml` key, containing all extracted configurations.

3. To deploy a Busola with builtin extensions on a cluster, use either `resources/apply-resources.sh` (while deploying Busola on a cluster without Istio) or `resources/apply-resources-istio.sh` (while deploying Busola on a cluster with Istio), then use the following commands to patch the created Busola instance with builtin extensions.

```bash
export NAMESPACE=<namespace where Busola is already installed>
kubectl apply -k resources/extensions-patch --namespace=$NAMESPACE
```
