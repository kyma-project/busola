# Config Map for resource-based extensions

## Overview

This document describes the required Config Map sections that you need to configure in order to handle your CRD UI page.
All sections can be provided as either JSON or YAML.

## resource section

The `resource` section is required and contains basic information about the resource. For example, `kind` and API details.

- **kind** - _[required]_ Kubernetes kind of the resource.
- **group** - _[required]_ API group used for all requests.
- **version** - _[required]_ API version used for all requests.
- **scope** - either `namespace` or `cluster`. Defaults to `cluster`.
- **path** - path fragment for this resource used in the URL. Defaults to pluralized lowercase **kind**. Used to provide an alternative URL to avoid conflicts with other resources.

### Example

```json
{
  "kind": "MyResource",
  "group": "networking.istio.io",
  "version": "v1alpha3",
  "scope": "namespace"
}
```

## schema section

The `schema` section contains the JSON-schema definition of the resource. In most cases this is copied verbatim from the CRD. The schema is the basis for generating the create/edit forms and the resultant resource yaml using [ui-schema](https://ui-schema.bemit.codes/).

## form section

The `form` section contains a list of objects that define which fields you must include in the final form. All given fields are placed in the advanced form by default. It's possible to add a field to the simple form by providing the `simple: true` flag. You can also remove it from the advanced form by providing the `advanced: false` flag.

If you target elements of an array rather that the array itself, you can use `items[]` notation.

### Item parameters

- **path** - _[required]_ path to the property that you want to display in the form. In the case of an array, the array index is omitted. For example, if `spec.items` is an array and you want to display `name` for each item, the path is `spec.items.name`.
- **widget** - optional widget used to render the field referred to by the **path** property. If you don't provide the widget, a default handler is used depending on the data type provided in the schema. For more information about the available widgets, see [Form widgets](form-widgets.md).
- **simple** - parameter used to display the simple form. It is `false` by default.
- **advanced** - parameter used to display the advanced form. It is `true` by default.

### Example

```json
[
  { "path": "spec.priority", "simple": true },
  { "path": "spec.items[].name" },
  { "path": "spec.items[].service.url" },
  { "path": "spec.items[].service.port" }
]
```

## list section

The `list` section defines extra columns available in the list. The format is similar to the `form` section, however each entry consists only of two values:

### Item parameters

- **path** - _[required]_ contains the path to the data used for the column.
- **widget** - optional widget used to render the field referred to by the `path` property. By default the value is displayed verbatim. For more information about the available widgets, see [Display widgets](display-widgets.md).
- **valuePreprocessor** - name of [value preprocessor](#value-preprocessors),
- **formula** - optional formula used to modify data referred to by the `path` property. In `formula` we use the following naming convention: `data.name` instead of just `name`. To learn more about using formulas, see [JSONata](https://docs.jsonata.org/overview.html).

### Example

```json
[
  { "path": "spec.url" },
  { "path": "spec.priority", "widget": "Badge" },
  { "path": "spec.toppings", "formula": "$join(data.name, ', ')" },
  {
    "name": "quantityIsMore",
    "path": "spec.toppings",
    "formula": "$filter(data, function ($v, $i, $a) { $v.quantity > $average($a.quantity) })"
  },
  { "path": "spec.volumes", "formula": "$join(data.name, ', ')" },
  {
    "path": "spec.volumes",
    "formula": "$filter(data, function ($v, $i, $a) {'configMap' in $keys($v)})" // List the array of Volume objects that have a config map
  },
  {
    "path": "spec.volumes",
    "formula": "data['configMap' in $keys($)]" // This is the alternative way of listing the array of Volume objects that have a config map
  },
  {
    "path": "spec.volumes",
    "formula": "$join(data['configMap' in $keys($)].name, ', ')" // List volume names of volumes that have a config map
  }
]
```

## details section

The `details` section defines the display structure for the details page. It contains two sections, `header` and `body`, both of which are a list of items to display in the `header` section and the body of the page respectively. The format of the entries is similar to the `form` section, however it has extra options available.

### Items parameters

- **path** - contains the path to the data used for the widget. Not required for presentational widgets.
- **name** - used for entries without `path` to define the translation source used for labels. Required if no `path` is present.
- **widget** - optional widget to render the defined entry. By default the value is displayed verbatim. For more information about the available widgets, see [Display widgets](display-widgets.md).
- **valuePreprocessor** - name of [value preprocessor](#value-preprocessors),
- **formula** - optional formula used to modify data referred to by the `path` property. To learn more about using formulas, see [JSONata](https://docs.jsonata.org/overview.html).
- **children** - a list of child widgets used for all `object` and `array` fields. Not available for header widgets.

Extra parameters might be available for specific widgets.

### Example

```json
{
  "header": [
    { "path": "metadata.name" },
    { "path": "spec.priority", "widget": "Badge" },
    { "path": "spec.volumes", "formula": "$join(data.name, ', ')" }
  ],
  "body": [
    {
      "name": "columns",
      "widget": "Columns",
      "children": [
        { "name": "left-panel", "widget": "Panel" },
        { "name": "right-panel", "widget": "Panel" }
      ]
    },
    {
      "name": "summary",
      "widget": "Panel",
      "children": [
        { "path": "metadata.name" },
        { "path": "spec.priority", "widget": "Badge" },
        {
          "name": "Volumes names of volumes with config map",
          "path": "spec.volumes",
          "formula": "$join(data['configMap' in $keys($)].name, ', ')"
        }
      ]
    },
    {
      "path": "spec.details",
      "widget": "CodeViewer",
      "language": "json"
    },
    {
      "path": "spec.configPatches",
      "widget": "Panel",
      "children": [{ "path": "applyTo" }, { "path": "match.context" }]
    },
    {
      "path": "spec.configPatches",
      "widget": "Table",
      "children": [{ "path": "applyTo" }, { "path": "match.context" }]
    }
  ]
}
```

### Data scoping

Whenever an entry has both `path` and `children` properties, the paths of `children` are relative to the parent. For example:

```json
[
  {
    "path": "spec",
    "widget": "Panel",
    "children": [{ "path": "entry1" }, { "path": "entry2" }]
  }
]
```

renders the same set of data as:

```json
[
  {
    "name": "spec",
    "widget": "Panel",
    "children": [{ "path": "spec.entry1" }, { "path": "spec.entry2" }]
  }
]
```

## relations section

The `relations` section contains an object that maps a relation name to a relation configuration object. The relation name preceded by a dollar sign '\$' is used in the `path` expression.

It's possible to use both relation name and a path; for example, `{"path": $myRelatedResource.metadata.labels}` returns the `metadata.labels` of the related resource.

### Relation configuration object fields

Those fields are used to build the related resource URL and filter the received data.

- **kind** - _[required]_ Kubernetes resource kind.
- **group** - _[required]_ Kubernetes resource group.
- **version** - _[required]_ Kubernetes resource version.
- **namespace** - the resource's Namespace name; it defaults to the original resource's Namespace. If set to `null`, the relation matches cluster-wide resources or resources in all Namespaces.
- **resourceName** - a specific resource name; leave empty to match all resources of a given type.
- **ownerLabelSelectorPath** - the path to original object's `selector` type property; for example, `spec.selector.matchLabels` for Deployment, used to select matching Pods.
- **selector** - [JSONata](https://docs.jsonata.org/overview.html) function enabling the user to write a custom matching logic. It receives a data context of:

  ```js
  {
    data, // related resource
    resource, // original resource
  }
  ```

  This function should return a boolean value.

### Example

```json
{
  "deployments": {
    "resource": ...
    "details": {
       "body": [
         {
            "widget": "ResourceList",
            "path": "$myPods"
        }
      ]
    }
  },
  "relations": {
    "myPods": {
      "kind": "Pod",
      "group": "api",
      "version": "v1",
      "ownerLabelSelectorPath": "spec.selector.matchLabels"
    }
  }
}
```

## translations sections

You can provide this section as a single `translations` section that contains all available languages formatted for i18next either as YAML or JSON, based on their paths.

### Predefined translation keys

- **category** - the name of a category used for the left-hand menu. It is placed in a **Custom Resources** category by default.
- **name** - title used in the navigation and on the list screen. It defaults to its resource kind.
- **description** - a more in-depth description of the resource displayed on the list screen. Only displayed if present.

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

### Language-specific sections

Alternatively, you can provide `translations-{lang}` sections for a single language. For example:

`translations-en`:

```yaml
category: My category
name: My Resource
metadata:
  name: Name
spec:
  items: Items
```

`translations-de`:

```yaml
category: meine Kategorie
name: Meine Ressource
metadata:
  name: Name
spec:
  items: Artikel
```

If you provide both `translations` and `translations-{lang}` sections, they are merged together.

### Value preprocessors

Value preprocessors are used as a middleware between a value and the actual renderer. They can transform a given value and pass it further or stop processing, rendering to view early.

#### List of value preprocessors

- **PendingWrapper** - useful when value resolves to a triple of `{loading, error, data}`:

  - For `loading` equal to `true`, it displays a loading indicator.
  - For truthy `error`, it displays an error message.
  - Otherwise, it passes `data` to the display component.

  Unless you need custom handling of error or loading state, we recommend using the `PendingWrapper`, for example, for fields that use [related resources](#relations-section).
