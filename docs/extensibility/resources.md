# Resource-based extensions

## Introduction

Resource-based extensions are means for users to introduce custom resource pages to Busola. To achieve that, you need to create a Config Map in the `kube-public` Namespace with a label `busola.io/extension=resource`.

The Config Map needs to have several fields created that define how the resources are handled.

All sections can be provided as either JSON or YAML.

## Config Map sections

### resource section

The `resource` section is required and contains basic information about the resource. For example, `kind` and api details.

- **kind** - _[required]_ kubernetes kind of the resource.
- **group** - _[required]_ api group used for all requests.
- **version** - _[required]_ api version used for all requests.
- **path** - path fragment for this resource used in the url. Defaults to pluralized lowercase `kind`. Used mostly to provide an alternative url to avoid conflicts with other resources.
- **scope** - either `namespace` or `cluster`. Defaults to `cluster`.

#### Example

```json
{
  "kind": "MyResource",
  "group": "networking.istio.io",
  "version": "v1alpha3",
  "scope": "namespace"
}
```

### schema section

The `schema` section contains the JSON-schema definition of the resource. In most cases this is copied verbatim from the CRD. The schema is the basis for generating the create/edit forms and the resultant resource yaml using [ui-schema](https://ui-schema.bemit.codes/).

### form section

The `form` section contains a list of objects that define which fields must be included in the final form. All given fields are placed in the advanced form by default. It's possible to add a field to simple form by providing the `simple: true` flag, or removing it from advanced form by providing the `advanced: false` flag.

#### Item parameters

- **path** - _[required]_ path to the property that must be displayed in the form. In case of an array the array index is omitted. For example, if `spec.items` is an array and you want to display `name` for each items, the path is `spec.items.name`.
- **widget** - optional widget used to render the field referred to by the `path` property. If no widget is provided a default handler is used depending on the data type provided in the schema. For more information about the available widgets, see [Form widgets](form-widgets.md).
- **simple** - to display in the simple form. By default it is false.
- **advanced** - to display in the advanced form. By default it is true.

### Example

```json
[
  { "path": "spec.priority", "simple": true },
  { "path": "spec.items.name" },
  { "path": "spec.items.service.url" },
  { "path": "spec.items.service.port" }
]
```

### list section

The `list` section defines extra columns available in the list. The format is similar to the `form` section, however each entry consists only of two values:

#### Item parameters

- **path** - _[required]_ contains the path to the data used for the column.
- **widget** - optional widget used to render the field referred to by the `path` property. By default the value is displayed verbatim. For more information about the available widgets, see [Display widgets](display-widgets.md).

#### Example

```json
[{ "path": "spec.url" }, { "path": "spec.priority", "widget": "Badge" }]
```

### details section

The `details` section defines the display structure for the details page. It contains two sections, `header` and `body`, both of which are a list of items to display in the `header` section and the body of the page respectively. The format of the entries is similar to the `form` section, however it has extra options available.

#### Items parameteres

- **path** - contains the path to the data used for the widget. Not required for presentational widgets.
- **name** - used for entries without `path` to define the translation source used for labels. Required if no `path` is present.
- **widget** - optional widget to render the defined entry. By default the value is displayed verbatim. For more information about the available widgets, see [Display widgets](display-widgets.md).
- **children** - a list of child widgets used for all `object` and `array` type of fields. Not available for header widgets.

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
      "children": [{ "path": "applyTo" }, { "path": "match.context" }]
    }
  ]
}
```

#### Data scoping

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

### translations sections

This section can be provided as a single `translations` section that contains all available languages, formatted for i18next either as YAML or JSON, based on their paths.

#### Predefined translation keys

- **category** - the name of a category used for the left-hand menu. By default it is placed into a **Custom Resources** category.
- **name** - title used in the navigation and on the list screen. It defaults to its resource kind.
- **description** - a more in-depth description of the resource displayed on the list screen. It is only displayed if present.

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

#### Language-specific sections

Alternatively, `translations-{lang}` sections can be provided for a single language only. For example:

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

If both `translations` and `translations-{lang}` sections are provided, they are merged together.
