# Config Map for resource-based extensions

**Table of Contents**

- [Overview](#overview)
- [Extension version](#extension-version)
- [_general_ section](#general-section)
- [_form_ section](#form-section)
- [_list_ section](#list-section)
- [_details_ section](#details-section)
- [_dataSources_ section](#datasources-section)
  - [Data source configuration object fields](#data-source-configuration-object-fields)
- [_translations_ section](#translations-section)
  - [Value preprocessors](#value-preprocessors)
    - [List of value preprocessors](#list-of-value-preprocessors)

## Overview

This document describes the required ConfigMap setup that you need to configure in order to handle your CRD UI page.
You can provide all the ConfigMap data sections as either JSON or YAML.

## Extension version

The version is a string value that defines in which version the extension is configured. It is stored as a value of the `busola.io/extension-version` label. If the configuration is created with the **Create Extension** button, this value is provided automatically. When created manually, use the latest version number, for example, `'0.5'`

Busola supports only the current version of the configuration and the prior one.

Therefore, whenever a new version of the configuration is proposed, you can migrate your configuration to the latest version. To do so, go to your Extension and click the **Migrate** button.

## _general_ section

The **general** section is required and contains basic information about the resource and additional options.

### Item parameters

- **resource** - _[required]_ - information about the resoure.
  - **kind** - _[required]_ Kubernetes kind of the resource.
  - **version** - _[required]_ API version used for all requests.
  - **group** - API group used for all requests. Not provided for Kubernetes resources in the core (also called legacy) group.
  - **name** - title used in the navigation and on the list screen. It defaults to its resource kind.
- **category** the name of a category used for the left-hand menu. It is placed in the `Custom Resources` category by default.
- **scope** - either `namespace` or `cluster`. Defaults to `cluster`.
- **urlPath** - path fragment for this resource used in the URL. Defaults to pluralized lowercase **kind**. Used to provide an alternative URL to avoid conflicts with other resources.
- **defaultPlaceholder** - to be shown in place of empty resource leaves. Overridden by the widget-level **placeholder**. Defaults to `-`.
- **description** - displays a custom description on the resource list page. It can contain links. If the **translations** section has a translation entry with the ID that is the same as the **description** string, the translation is used.
- **filter** - optional [JSONata](https://docs.jsonata.org/overview.html) [filter](https://docs.jsonata.org/higher-order-functions#filter) used to filter the resources shown at the list section property.
- **disableCreate** - either `true` or `false`. Defaults to `false`.

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

To customize the **form** section see the [form section](form-section.md) documentation.
Views created with the extensibility [ConfigMap wizard](README.md) have a straightforward form configuration by default.

## _list_ section

The **list** section presents the resources of a kind, that is, Secrets or ConfigMaps, and comes with a few predefined columns: **Name**, **Created**, and **Labels**.
Should you want to add your own columns, see [Display section](display-section.md) to learn how to customize both list and details views.

## _details_ section

The **details** section presents the resource details. To customize it, see [Display section](display-section.md). The default details header contains some basic information. The body is empty by default.

## _dataSources_ section

The **dataSources** section contains an object that maps a data source name to a data source configuration object. The data source name preceded by a dollar sign '\$' is used in the **source** expression.

Data sources are provided in all [JSONata](https://docs.jsonata.org/overview.html) formulas as functions to call. For example, `{ "source": $myRelatedResource().metadata.labels }` returns the `metadata.labels` of the related resource.

Since the whole request is being provided, individual resources can be accessed using the `items` field, for example `{ "widget": "Table", "source": "$myRelatedResources().items" }`.

### Data source configuration object fields

Those fields are used to build the related resource URL and filter the received data.

- **resource**:
  - **kind** - _[required]_ Kubernetes resource kind.
  - **group** - Kubernetes resource group. Not provided for Kubernetes resources in the core (also called legacy) group.
  - **version** - _[required]_ Kubernetes resource version.
  - **namespace** - the resource's Namespace name; it defaults to the original resource's Namespace. If set to `null`, cluster-wide resources or resources in all Namespaces are matched.
  - **name** - a specific resource name; leave empty to match all resources of a given type.
- **ownerLabelSelectorPath** - the path to original object's **selector** type property; for example, `spec.selector.matchLabels` for Deployment, used to select matching Pods.
- **filter** - [JSONata](https://docs.jsonata.org/overview.html) function enabling the user to write a custom matching logic. It uses the following variables:

  - **item** - the current item of the related kind.
  - **root** - the original resource.

  This function should return a boolean value.
  You can also use the `matchByLabelSelector` function to see the matched Pods. To do that, provide the Pods as `$item`, and path to the labels.

### Examples

```json
{
  "deployments": {
    "general": ...
    "details": {
       "body": [
         {
            "widget": "ResourceList",
            "source": "$myPods()"
        }
      ]
    }
  },
  "dataSources": {
    "myPods": {
      "resource": {
        "kind": "Pod",
        "version": "v1",
      },
      "ownerLabelSelectorPath": "spec.selector.matchLabels"
    }
  }
}
```

```json
{
  "secrets": {
    "general": ...
    "details": {
       "body": [
         {
            "widget": "ResourceList",
            "path": "$mySecrets"
        }
      ]
    }
  },
  "dataSources": {
    "mySecrets": {
      "resource": {
        "kind": "Secret",
        "version": "v1",
        "namespace": null
      },
      "filter": "$root.spec.secretName = $item.metadata.name and $root.metadata.namespace = $item.metadata.namespace"
    }
  }
}
```

```json
{
  "podSelector": {
    "resource": {
      "kind": "Pod",
      "version": "v1"
    },
    "filter": "$matchByLabelSelector($item, $root.spec.selector)"
  }
}
```

## _translations_ section

This optional section contains all available languages formatted for [i18next](https://www.i18next.com/) either as YAML or JSON, based on their paths. When a name is provided for a widget, that value can be used as the key, and the value is the translation for a specific language.

In addition, if no name is provided, form widgets automatically try to fetch a translation based on their full **path** attribute (always starting from the root object `spec.property...`), and if that fails, they use a prettified version of the last path item as their name (for example `spec.itemDescription` is prettified to "Item Description"), and by extension as a potential translation key.

### Example

```yaml
en:
  category: My category
  name: My Resource
  metadata:
    name: Name
  spec:
    items: Items
de:
  category: meine Kategorie
  name: Meine Ressource
  metadata:
    name: Name
  spec:
    items: Artikel
```

### Value preprocessors

Value preprocessors are used as a middleware between a value and the actual renderer. They can transform a given value and pass it to the widget; or stop processing and render it so you can view it immediately, without passing it to the widget.

#### List of value preprocessors

- **PendingWrapper** - useful when value resolves to a triple of `{loading, error, data}`:

  - For `loading` equal to `true`, it displays a loading indicator.
  - For truthy `error`, it displays an error message.
  - Otherwise, it passes `data` to the display component.

  Unless you need custom handling of error or loading state, we recommend using **PendingWrapper**, for example, for fields that use [data sources](#datasources-section).
