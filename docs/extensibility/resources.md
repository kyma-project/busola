# Config Map for resource-based extensions

**Table of Contents**

- [Overview](#overview)
- [Extension version](#extension-version)
- [_general_ section](#general-section)
- [_form_ section](#form-section)
- [_list_ section](#list-section)
- [_details_ section](#details-section)
- [Value preprocessors](#value-preprocessors)
  - [List of value preprocessors](#list-of-value-preprocessors)

## Overview

This document describes the required ConfigMap setup that you need to configure in order to handle your CRD UI page.
You can provide all the ConfigMap data sections as either JSON or YAML.

## Extension version

The version is a string value that defines in which version the extension is configured. It is stored as a value of the `busola.io/extension-version` label. If the configuration is created with the **Create Extension** button, this value is provided automatically. When created manually, use the latest version number, for example, `'0.5'`.

> **NOTE:**: Busola supports only the two latest versions of the configuration. Whenever a new version of the configuration is proposed, go to your Extension and migrate your configuration to the latest version.

## _general_ section

The **general** section is required and contains basic information about the resource and additional options.

### Item parameters

- **resource** - _[required]_ - information about the resoure.
  - **kind** - _[required]_ Kubernetes kind of the resource.
  - **version** - _[required]_ API version used for all requests.
  - **group** - API group used for all requests. Not provided for Kubernetes resources in the core (also called legacy) group.
- **name** - title used in the navigation and on the list screen. It defaults to its resource kind.
- **category** - the name of a category used for the left-hand menu. By default, it's placed in the `Custom Resources` category.
- **icon** suffix of an icon name used for the left-hand menu. the default value is `customized`. You can find the list of icons [here](https://sap.github.io/fundamental-react/?path=/docs/component-api-icon--primary).
- **scope** - either `namespace` or `cluster`. Defaults to `cluster`.
- **urlPath** - path fragment for this resource used in the URL. Defaults to pluralized lowercase **kind**. Used to provide an alternative URL to avoid conflicts with other resources.
- **defaultPlaceholder** - to be shown in place of an empty text placeholder. Overridden by the widget-level **placeholder**. Defaults to `-`.
- **description** - displays a custom description on the resource list page. It can contain links. If the **translations** section has a translation entry with the ID that is the same as the **description** string, the translation is used.
- **filter** - optional [JSONata](https://docs.jsonata.org/overview.html) [filter](https://docs.jsonata.org/higher-order-functions#filter) used to filter the resources shown at the list section property.
- **disableCreate** - when set to `true`, it disables the **Create** button. Defaults to `false`.

### Example

```json
{
  "resource": {
    "kind": "MyResource",
    "version": "v1alpha3",
    "group": "networking.istio.io"
  },
  "name": "MyResourceName",
  "category": "My Category",
  "scope": "namespace",
  "defaultPlaceholder": "- not set -",
  "description": "See the {{[docs](https://github.com/kyma-project/busola)}} for more information.",
  "filter": "$filter(data, function($item) {$item.type = 'Opaque'})",
  "disableCreate": false
}
```

## _form_ section

To customize the **form** section see the [Create forms with extensibility](form-section.md) documentation.
Views created with the extensibility [ConfigMap wizard](README.md) have a straightforward form configuration by default.

## _list_ section

The **list** section presents the resources of a kind, that is, Secrets or ConfigMaps, and comes with a few predefined columns: **Name**, **Created**, and **Labels**.
If you want to add your own columns, see [Customize UI display](display-section.md) to learn how to customize both list and details views.

## _details_ section

The **details** section presents the resource details. To customize it, see [Customize UI display](display-section.md). The default details header contains some basic information. By default, the body is empty.

## Value preprocessors

Value preprocessors are used as a middleware between a value and the actual renderer. They can transform a given value and pass it to the widget; or stop processing and render it so you can view it immediately, without passing it to the widget.

### List of value preprocessors

- **PendingWrapper** - useful when value resolves to a triple of `{loading, error, data}`:

  - For `loading` equal to `true`, it displays a loading indicator.
  - For truthy `error`, it displays an error message.
  - Otherwise, it passes `data` to the display component.

  Unless you need custom handling of error or loading state, we recommend using **PendingWrapper**, for example, for fields that use [data sources](datasources-section.md).
