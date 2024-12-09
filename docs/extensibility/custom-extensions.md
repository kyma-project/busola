# Custom Extensions

Busola's custom extension feature allows you to design fully custom user interfaces that go beyond the built-in extensibility functionality. This feature is ideal for creating unique and specialized displays that are not covered by the standard built-in components.

## Getting Started

First, to enable the custom extension feature you need to set the corresponding feature flag in your busola config, which is disabled by default.

```yaml
EXTENSIBILITY_CUSTOM_COMPONENTS:
  isEnabled: true
```

## Creating custom extensions

Creating a custom extension is as straightforward as setting up a ConfigMap with the following sections:

- `data.general`: Contains configuration details
- `data.customHtml`: Defines static HTML content
- `data.customScript`: Adds dynamic behavior to your extension.

Once your ConfigMap is ready, add it to your cluster, and Busola will load and display your custom UI.

The best way to get familiar with this mechanism is to have a look at our [example](./../../examples/custom-extension/README.md), where everything is explained in detail.
