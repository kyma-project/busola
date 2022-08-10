# Display widgets

You can use display widgets in the lists and details pages.

## Inline widgets

Use inline widgets for simple values in lists, details headers, and details bodies.

### Badge

Badge widgets render texts as a status badge, using a set of predefined rules to assign colors.

#### Widget-specific parameters

- **placeholder** - an optional property to change the default empty text placeholder `-` with a custom string.
  If the `translations` section has a translation entry with the ID that is the same as the **placeholder** string, the translation is used.
- **highlights** - an optional map of highlight rules. Key refers to the type of highlight, while the rule can just be a plain array of values or a string containing a jsonata rule. Allowed keys are `informative` `positive`, `negative` and `critical`.

#### Default highlight rules

When no highlights are provided, the following values are automatically handled:

- rendered as informative: `initial`, `pending`, `available`, `released`.
- rendered as positive: `ready`, `bound`, `running`, `success`, `succeeded`, `ok`.
- rendered as negative: `unknown`, `warning`.
- rendered as critical: `error`, `failure`, `invalid`.

#### Example

```json
{
  "path": "status.value",
  "widget": "Badge",
  "placeholder": "-",
  "highlights": {
    "positive": ["yes", "ok"],
    "negative": "data < 0"
  }
}
```

<img src="./assets/display-widgets/Badge.png" alt="Example of a badge widget" width="20%" style="border: 1px solid #D2D5D9">

### ControlledBy

ControlledBy widgets render the kind and the name with a link to the resources that the current resource is dependent on.

#### Widget-specific parameters

- **placeholder** - an optional property to change the default empty text placeholder `-` with a custom string.
  If the `translations` section has a translation entry with the ID that is the same as the **placeholder** string, the translation is used.
- **kindOnly** - used to determine if the resource name is displayed. Defaults to _false_.

#### Examples

##### Kind and name link

```json
{
  "path": "metadata.ownerReferences",
  "widget": "ControlledBy",
  "placeholder": "-"
}
```

<img src="./assets/display-widgets/ControlledBy.png" alt="Example of a ControlledBy widget" width="50%" style="border: 1px solid #D2D5D9">

##### Kind only

```json
{
  "path": "metadata.ownerReferences",
  "widget": "ControlledBy",
  "placeholder": "-",
  "kindOnly": true
}
```

<img src="./assets/display-widgets/ControlledBy--kindOnly.png" alt="Example of a ControlledBy widget without name link" width="50%" style="border: 1px solid #D2D5D9">

### JoinedArray

JoinedArray widgets render all the values of an array of strings as a comma-separated list.

#### Widget-specific parameters

- **separator** - a string by which the elements of the array will be separated by. The default value is a comma `,`.

#### Example

```json
{
  "name": "Joined array",
  "path": "spec.dnsNames",
  "widget": "JoinedArray",
  "separator": ": "
}
```

<img src="./assets/display-widgets/JoinedArray.png" alt="Example of a joined array widget" width="20%" style="border: 1px solid #D2D5D9">

### Labels

Labels widgets render all the object entries in the `key-value` format.

#### Widget-specific parameters

- **placeholder** - an optional property to change the default empty text placeholder `-` with a custom string.
  If the `translations` section has a translation entry with the ID that is the same as the **placeholder** string, the translation is used.

```json
{
  "path": "spec.orderDetails",
  "widget": "Labels",
  "placeholder": "-"
}
```

<img src="./assets/display-widgets/Labels.png" alt="Example of a Labels widget" width="20%" style="border: 1px solid #D2D5D9">

### ResourceLink

ResourceLink widgets render internal links to Kubernetes resources.

#### Widget-specific parameters

- **resource** - To create a hyperlink, Busola needs the name and the kind of the target resource; they must be passed into the **resource** object as property paths in either **data** - value extracted using **path**, or **root** - the original resource. If the target resource is in a `namespace`, provide **namespace**, **name**, and **kind** properties.
- **linkText** - this property has access to **data** and **root**. This makes it possible to insert resource properties into a translation.

#### Example

##### details section

```json
{
  "widget": "ResourceLink",
  "path": "metadata.ownerReferences[0]",
  "linkText": "otherTranslations.linkText",
  "resource": {
    "name": "data.name",
    "namespace": "root.metadata.namespace",
    "kind": "data.kind"
  }
}
```

<img src="./assets/display-widgets/ResourceLink.png" alt="Example of a ResourceLink widget" style="border: 1px solid #D2D5D9">

##### translations section

```yaml
en:
  otherTranslations.linkText: Go to {{data.kind}} {{data.name}}.
```

### Text

Text widgets render values as a simple text. This is the default behavior for all scalar values.

#### Widget-specific parameters

- **placeholder** - an optional property to change the default empty text placeholder `-` with a custom string.
  If the `translations` section has a translation entry with the ID that is the same as the **placeholder** string, the translation is used.

#### Example

```json
{
  "path": "spec.label",
  "widget": "Text",
  "placeholder": "-"
}
```

<img src="./assets/display-widgets/Text.png" alt="Example of a text widget" width="20%" style="border: 1px solid #D2D5D9">

## Block widgets

Block widgets are more complex layouts and you must use them only in the details body.

### CodeViewer

CodeViewer widgets display values using a read-only code editor.

#### Widget-specific parameters

- **language** - used for code highlighting. The editor supports languages handled by [Monaco](https://code.visualstudio.com/docs/languages/overview).
  If the language is not specified, the editor tries to display the content as `yaml` with a fallback to `json`.

#### Example

```json
{
  "path": "spec.json-data",
  "widget": "CodeViewer",
  "language": "yaml"
}
```

<img src="./assets/display-widgets/CodeViewer.png" alt="Example of a CodeViewer widget" style="border: 1px solid #D2D5D9">

### Columns

Columns widgets render the child widgets in multiple columns.

#### Widget-specific parameters

- **inline** - an optional flag to change the layout mode.

  - **true** - list is displayed inline, wrapped if needed. It is a default option for lists, panels, and headers.
  - **false** - list is displayed as a grid.

#### Example

```json
{
  "name": "columns.container",
  "widget": "Columns",
  "children": [
    {
      "name": "columns.left",
      "widget": "Panel",
      "children": [{ "path": "spec.value", "placeholder": "-" }]
    },
    {
      "name": "columns.right",
      "widget": "Panel",
      "children": [{ "path": "spec.other-value" }]
    }
  ]
}
```

<img src="./assets/display-widgets/Columns.png" alt="Example of a columns widget" style="border: 1px solid #D2D5D9">

### Panel

Panel widgets render an object as a separate panel with its own title (based on its `path` or `name`).

#### Example

```json
{
  "name": "details",
  "widget": "Panel",
  "children": [
    { "path": "spec.value" },
    { "path": "spec.other-value", "placeholder": "-" }
  ]
}
```

<img src="./assets/display-widgets/Panel.png" alt="Example of a panel widget" style="border: 1px solid #D2D5D9">

### Plain

Plain widgets render all contents of an object or list sequentially without any decorations. This is the default behavior for all objects and arrays.

### ResourceList

ResourceList widgets render a list of Kubernetes resources. The ResourceList widgets should be used along with [related resources](resources.md#datasources-section).

#### Widget-specific parameters

- **children** optional field used to obtain custom columns. If not set, the configuration is reused based on the existing resource list defined in Busola.
- **sort** - optional sort option. Array of objects with the following properties that allow to sort by it's value:
  - **path** - _[required]_ contains the path to the data used for the column.
  - **default** - optional flag. If set to `true`, the list view is sorted by this value by default.
  - **compareFunction** - optional [JSONata](https://docs.jsonata.org/overview.html) compare function. It is required to use `$first` and `$second` variables when comparing two values. There is a special custom function `$compareStrings` used to compare two strings, for example, `$compareStrings($first, $second)`

#### Examples

```json
{
  "widget": "ResourceList",
  "path": "$myRelatedResource",
  "name": "Example ResourceList Deployments",
  "sort": [
    {
      "path": "spec.replicas",
      "default": true,
      "compareFunction": "$second - $first"
    },
    {
      "path": "spec.strategy.type"
    }
  ]
}
```

<img src="./assets/display-widgets/ResourceList.png" alt="Example of a ResourceList widget" style="border: 1px solid #D2D5D9">

---

```json
{
  "widget": "ResourceList",
  "path": "$mySecrets",
  "name": "Example ResourceList Secret with children",
  "children": [
    {
      "path": "metadata.name",
      "name": "Name",
      "sort": "true",
      "widget": "ResourceLink",
      "resource": {
        "name": "data.name",
        "namespace": "root.metadata.namespace",
        "kind": "data.kind"
      }
    },
    {
      "path": "type",
      "name": "Type",
      "sort": {
        "default": true
      }
    }
  ]
}
```

<img src="./assets/display-widgets/ResourceListChildren.png" alt="Example of a ResourceList widget with children" style="border: 1px solid #D2D5D9">

### ResourceRefs

ResourceRefs widgets render the lists of links to the associated resources. The corresponding specification object must be an array of objects `{name: 'foo', namespace: 'bar'}`.

#### Widget-specific parameters

- **kind** - _[required]_ Kubernetes kind of the resource.

#### Example

```json
{
  "path": "spec.item-list",
  "widget": "ResourceRefs",
  "kind": "Secret"
}
```

<img src="./assets/display-widgets/ResourceRefs.png" alt="Example of a ResourceRefs widget" style="border: 1px solid #D2D5D9">

### Table

Table widgets display array data as rows of a table instead of free-standing components. The **children** parameter defines the values used to render the columns. Similar to the `list` section of the Config Map, you should use inline widgets only as children.

#### Widget-specific parameters

- **collapsible** - an optional array of extra widgets to display as an extra collapsible section. Uses the same format as the **children** parameter.
- **sort** - optional sort option. If set to true, it allows to sort via this value. Defaults to false. It can also be set to an object with the following properties:
  - **default** - optional flag. If set to `true`, the list view is sorted by this value by default.
  - **compareFunction** - optional [JSONata](https://docs.jsonata.org/overview.html) compare function. It is required to use `$first` and `$second` variables when comparing two values. There is a special custom function `$compareStrings` used to compare two strings, for example, `$compareStrings($first, $second)`

#### Example

```json
{
  "path": "spec.toppings",
  "widget": "Table",
  "collapsible": [{ "path": "quantity" }],
  "children": [
    { "path": "name", "sort": true },
    {
      "path": "price",
      "sort": { "default": true, "compareFunction": "$second -$first" }
    }
  ]
}
```

<img src="./assets/display-widgets/Table.png" alt="Example of a table widget" style="border: 1px solid #D2D5D9">
