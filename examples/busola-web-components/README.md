# Busola Web Components Example

This example demonstrates the use of custom web components, including the Dynamic Page and Monaco Editor. It showcases how to set attributes, properties and manage content.

## Prerequisites

Before you begin, ensure you have custom extensions enabled in your cluster:

```
kubectl apply -f busola-config.yaml
```

## Set Up Your Custom Busola Extension

To apply this example in your cluster execute:

```bash
kubectl kustomize . | kubectl apply -n kyma-system -f -
```

For more information follow [this]('examples/../../custom-extension/README.md) documentation.
