# Busola Web Components Example

This example demonstrates the use of custom web components, including the Dynamic Page and Monaco Editor. It showcases how to set attributes, properties and manage content.

## Prerequisites

Before you begin, ensure custom extensions are enabled in your Busola installation. The `EXTENSIBILITY_CUSTOM_COMPONENTS` feature flag is **installation-only** (it can no longer be enabled through a cluster's `kube-public/busola-config` ConfigMap). For local development, set it in `public/config/config.yaml`:

```yaml
config:
  features:
    EXTENSIBILITY_CUSTOM_COMPONENTS:
      isEnabled: true
```

See [Busola Configuration](../../docs/user/technical-reference/configuration.md) for details.

## Set Up Your Custom Busola Extension

To apply this example in your cluster execute:

```bash
kubectl kustomize . | kubectl apply -n kyma-system -f -
```

For more information follow [this]('examples/../../custom-extension/README.md) documentation.
