# Pizzas

## Overview

The `pizzas` example showcases Busola's extensibility feature.

The [`configuration`](https://github.com/kyma-project/busola/tree/main/examples/pizzas/configuration) directory consists of two CustomResourceDefinitions (CRDs) and two ConfigMaps that store the information about the extensibility configuration.

The [`samples`](https://github.com/kyma-project/busola/tree/main/examples/pizzas/configuration) directory includes YAML files with examples of the above CRDs.

## Installation

To test the extensibility feature using the Pizzas example, upload all the YAML files from the `configuration` and `samples` directories to your cluster. Follow the steps:

1. Access your cluster using kubectl. Download kubeconfig.yaml from the SAP BTP cockpit and export it in your terminal:

   ```bash
   export KUBECONFIG={KUBECONFIG_FILE_PATH}
   ```

2. In the terminal, go to `/busola/examples/pizzas`.

3. Create the `pizzas` namespace and apply the ConfigMaps and CRDs:

   ```bash
   kubectl create namespace pizzas && kubectl apply -f configuration/ --recursive
   ```

4. Apply the samples:

   ```bash
   kubectl apply -f samples/ --recursive
   ```

## Result

After uploading the files, refresh the browser. You should see the new items in the left-side navigation.

On the cluster level, in the **Extensions** section, you can find the two applied ConfigMaps, `pizzaorders` and `pizzas`. You can see the configuration details in the General, Form Fields, List Columns, Details View, Data Sources, or Translation sections taken from the `configuration` directory.

Go to **Namespaces** to find the newly created `pizzas` namespace. Go into the namespace and in the left-side navigation, in the **Lunch** category, see the details of two UI components: **Pizza Orders** and **Pizzas** with all the details taken from the `samples` directory.
