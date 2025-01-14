# Additional Sections for Resource-Based Extensions

## Form Section

To customize the **form** section see the [Create forms with extensibility](./40-form-fields.md) documentation.
Views created with the extensibility [ConfigMap wizard](README.md) have a straightforward form configuration by default.

## List Section

The **list** section presents the resources of a kind, that is, Secrets or ConfigMaps, and comes with a few predefined columns: **Name**, **Created**, and **Labels**.
If you want to add your own columns, see [Customize UI display](./30-details-summary.md) to learn how to customize both list and details views.

## Details Section

The **details** section presents the resource details. To customize it, see [Customize UI display](./30-details-summary.md). The default details header contains some basic information. By default, the body is empty.

## Value Preprocessors

Value preprocessors are used as a middleware between a value and the actual renderer. They can transform a given value and pass it to the widget, or stop processing and render it so you can view it immediately, without passing it to the widget.

### List of Value Preprocessors

- **PendingWrapper** - useful when value resolves to a triple of `{loading, error, data}`:

  - For `loading` equal to `true`, it displays a loading indicator.
  - For truthy `error`, it displays an error message.
  - Otherwise, it passes `data` to the display component.

  Unless you need custom handling of error or loading state, we recommend using **PendingWrapper**, for example, for fields that use [data sources](./datasources-section.md).
