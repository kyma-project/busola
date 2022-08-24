# Resources

## Overview

The `services` example showcases the Busola's extensibility feature with the Kubernetes Service resource.

The `configuration.yaml` file consists of a ConfigMap that stores the information about the extensibility configuration.

The `samples.yaml` file includes the example of a Service.

## Installation

To test the extensibility feature using the Service example, upload the `configuration.yaml` and `samples.yaml` files to your cluster. To upload all the resources use the following commands:

1. Create a `services` Namespace and apply the ConfigMap:

```bash
kubectl create namespace services && kubectl apply -f configuration.yaml
```

2. Apply the `samples.yaml` file:

```bash
kubectl apply -f samples.yaml
```

After uploading the files, refresh the browser. You should see a new item in the left-side navigation.

> **NOTE:** Remember [to enable the extensibility feature](./../../docs//features.md).
