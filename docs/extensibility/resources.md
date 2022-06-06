# Resource-based extensions

## Introduction

Resource-based extensions are a means of introducing custom resource pages to busola. To achieve that a Config Map needs to be created in the `kube-public` namespace with a label `busola.io/extension=resource`.

The Config Map needs to have several fields created that define how the resources is handled.

All sections can be provided as either json or yaml.

## Config Map sections

### `resource` section

The resource section is required and contains basic information about the resource - namely kind and api details.

#### Example

```json
{
  "kind": "MyResources",
  "group": "networking.istio.io",
  "version": "v1alpha3"
}
```

### `navigation` section

The navigation section is required and defines this resource's availability in the menu and generated url. The name of the menu entry as well as category it's going to be placed in are read from the translation section's `name` and `category` entries respectively.

#### Item paremeters

- **path** - path for this resource to use in the url,
- **scope** - either `namespace` or `cluster`.

#### Example

```json
{
  "path": "my-resources",
  "scope": "namespace"
}
```

### `form` section

Form section modifies the original schema (provided in the schema section) for use with [ui-schema](https://ui-schema.bemit.codes/) to generate the create/edit form for the resource. It contains a list of objects that define what fields should be included in the final form. All given fields are placed in the advanced form by default, however it's possible to add a field to simple form by providing the `simple: true` flag, or removing it from advanced form by providing the `advanced: false` flag.

#### Item parameters

- **path** - [required] path to the property that should be displayed in the form. In case of an array the array index is ommited (so for instance if `spec.items` is an array and we want to display `name` for each items, the path would simply be `spec.items.name`),
- **widget** - optional widget to render the field. If no widget is provided a default handler will be used depending on the data type provided in the schema. For more information about the available widgets see [Form widgets](form-widgets.md),
- **simple** - whether to display in the simple form. By default it is false,
- **advanced** - whether to diplay in the advanced form. By default it is true.

### Example

```json
[
  { "path": "spec.priority", "simple": true },
  { "path": "spec.items.name" },
  { "path": "spec.items.service.url" },
  { "path": "spec.items.service.port" }
]
```

### `list` section

List section defines extra columns available in the list. The format is similar to the form section, however each entry consists only of two values:

#### Item parameters

- **path** - [required] contains the path to the data to use for the column,
- **widget** - optional widget used to render the field. By default the value will be displayed verbatim. For more information about the available widgets see [Display widgets](display-widgets.md).

#### Example

```json
[{ "path": "spec.url" }, { "path": "spec.priority", "widget": "Badge" }]
```

### `details` section

Details section defines the display structure for the details page. It contains two sections, `header` and `body`, both of which are a list of item to display in the header section and the body of the page respectively. The format of the entries is at the core similar to the form section, however it has extra options available.

The resource section is required and contains basic information about the resource - namely kind and api details.

#### Items parameteres

- **path** - contains the path to the data to use for the widget. Not required for purely presentational widgets,
- **name** - used for entries without `path` to define the translation source used for labels. Required if no path is present,
- **widget** - optional widget to render the field. By default the value will be displayed verbatim. For more information about the available widgets see [Display widgets](display-widgets.md),
- **children** - a list of child widgets to use for all `object` and `array` type fields. Not available for header widgets.

Extra parameters might be available for specific widgets.

#### Example

```json
{
  "header": [
    { "path": "metadata.name" },
    { "path": "spec.priority", "widget": "Badge" }
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
        { "path": "spec.priority", "widget": "Badge" }
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
      "columns": [{ "path": "applyTo" }, { "path": "match.context" }]
    }
  ]
}
```

#### Note

Whenever an entry has both `path` and `children` properties, the paths of children are going to be relative to the parent. So for example:

```json
[
  {
    "path": "spec",
    "widget": "Panel",
    "children": [{ "path": "entry1" }, { "path": "entry2" }]
  }
]
```

will render the same set of data as:

```json
[
  {
    "name": "spec",
    "widget": "Panel",
    "children": [{ "path": "spec.entry1" }, { "path": "spec.entry2" }]
  }
]
```

### `schema` section

Schema contains the JSON-schema definition of the resource. In most cases this should simply be the CRD copied verbatim.

### `translations` sections

Translations can be provided as a single `translations` section that contains all available languages, formatted for i18next either as yaml or json, based on their paths.

#### Predefined translation keys

- **category** - the name of a category to use for the left-hand menu. By default it will be placed into a "Custom Resources" category,
- **name** - title to be used in the navigation and on the list screen. Defaults to it's resource kind,
- **description** - a more in-depth description of the resorce displaye on the list screen. It's only displayed if present.

#### Example

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

#### Note

Alternatively a `transations-{lang}` sections can be provided for a single language only. For example:

`translations-en`:

```yaml
category: My category
name: My Resource
metadata:
  name: Name
spec:
  items: Items
```

`translations-pl`:

```yaml
category: meine Kategorie
name: Meine Ressource
metadata:
  name: Name
spec:
  items: Artikel
```

If both `translations` and `translations-{lang}` sections are provided, they are merged together.
