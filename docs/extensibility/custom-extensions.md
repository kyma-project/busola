# Custom Extensions

Busola's custom extension feature allows you to design fully custom user interfaces beyond the built-in extensibility functionality. This feature is ideal for creating unique and specialized displays not covered by the built-in components.

## Getting Started

To enable the custom extension feature, you must set the corresponding feature flag in your Busola config, which is disabled by default.

```yaml
EXTENSIBILITY_CUSTOM_COMPONENTS:
  isEnabled: true
```

## Creating Custom Extensions

Creating a custom extension is as straightforward as setting up a ConfigMap with the following sections:

- `data.general`: Contains configuration details
- `data.customHtml`: Defines static HTML content
- `data.customScript`: Adds dynamic behavior to your extension.

Once your ConfigMap is ready, add it to your cluster, and Busola will load and display your custom UI.

See this [example](./../../examples/custom-extension/README.md), to learn more.
