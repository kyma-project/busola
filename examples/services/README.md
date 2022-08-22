# Resources

## Overview

The `services` example showcases the Busola's extensibility feature with the native Kubernetes resource.

The `configuration` directory consists of a ConfigMap that store the information about the extensibility configuration.

The `samples.yaml` file includes the example of a Service.

## Installation

To test the extensibility feature using the Service example, upload the YAML file from the `configuration` directory and the YAML with the example from the `samples.yaml` to your cluster. To upload all the resources use the following commands:

1. Create a `services` Namespace and apply the ConfigMaps and CRDs:

```bash
kubectl create namespace services && kubectl apply -f configuration/ --recursive
```

2. Apply the `samples.yaml` file:

```bash
kubectl apply -f samples.yaml
```

After uploading the files, refresh the browser. You should see new item in the left-side navigation.

> **NOTE:** Remember [to enable the extensibility feature](./../../docs//features.md).
