# Pizza

## Overview

The `resources` example showcases the Busola's extensibility feature with k8s resources.

The `configuration` directory consists of Config Maps that store the information about the extensibility configuration for specific resources.

The `samples.yaml` file includes the examples of the above resources.

## Installation

To test the extensibility feature using the resources examples, simply upload any of the YAML files from the `configuration` and `samples` directory to your cluster. To upload all the resources use the following commands:

1. Create a `resources` Namespace and apply the Config Maps and CRDs:

```bash
kubectl create namespace resources && kubectl apply -f configuration/ --recursive
```

2. Apply the `samples.yaml` file:

```bash
ubectl apply -f samples/ --recursive
```

After uploading the files, refresh the browser. You should see new items in the left-side navigation.
