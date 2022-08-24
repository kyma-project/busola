# Pizza

## Overview

The `pizzas` example showcases the Busola's extensibility feature.

The `configuration` directory consists of two CustomResourceDefinitions (CRD) and two ConfigMaps that store the information about the extensibility configuration.

The `samples.yaml` file includes the examples of the above CRDs.

## Installation

To test the extensibility feature using the Pizza example, simply upload all the YAML files from the `configuration` directory and the `samples.yaml` file to your cluster or use the following commands:

1. Create a `pizzas` Namespace and apply the ConfigMaps and CRDs:

```bash
kubectl create namespace pizzas && kubectl apply -f configuration/ --recursive
```

2. Apply the samples:

```bash
kubectl apply -f samples/ --recursive
```

After uploading the files, refresh the browser. You should see new items in the left-side navigation.
