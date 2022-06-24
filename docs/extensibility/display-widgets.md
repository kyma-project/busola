# Display widgets

Display widgets are used in the lists and details pages.

## Inline widgets

Inline widgets are used for simple values and are usable in lists, details headers, and details bodies.

### Text

Text widgets render values as a simple text. This is the default behavior for all scalar values.

#### Example

```json
{
  "path": "spec.label",
  "widget": "Text"
}
```

<img src="./assets/display-widgets/Text.png" alt="Example of a text widget" width="20%" style="border: 1px solid #D2D5D9">

### Badge

Badge widgets render texts as a status badge, using a set of predefined rules to assign colors.

The following values are automatically handled:

- rendered as an information: `initial`, `pending`, `available`, `released`.
- rendered as a success: `ready`, `bound`, `running`, `success`, `succeeded`, `ok`.
- rendered as a warning: `unknown`, `warning`.
- rendered as an error: `error`, `failure`, `invalid`.

#### Example

```json
{
  "path": "status.value",
  "widget": "Badge"
}
```

<img src="./assets/display-widgets/Badge.png" alt="Example of a badge widget" width="20%" style="border: 1px solid #D2D5D9">

## Block widgets

Block widgets are more complex layouts and should be used only in details body.

### Plain

Plain widgets render all contents of an object or list sequentially without any decorations. This is the default behavior for all objects and arrays.

### Panel

Panel widgets render an object as a separate panel with it's own title (based on it's `path` or `name`).

#### Example

```json
{
  "name": "details",
  "widget": "Panel",
  "children": [{ "path": "spec.value" }, { "path": "spec.other-value" }]
}
```

<img src="./assets/display-widgets/Panel.png" alt="Example of a panel widget" style="border: 1px solid #D2D5D9">

### Columns

Columns widgets render the child widgets in two columns.

#### Example

```json
{
  "name": "columns.container",
  "widget": "Columns",
  "children": [
    {
      "name": "columns.left",
      "widget": "Panel",
      "children": [{ "path": "spec.value" }]
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

### CodeViewer

CodeViewer widgets display values using a read-only code editor. The editor autodetects the language.

#### Example

```json
{
  "path": "spec.json-data",
  "widget": "CodeViewer"
}
```

<img src="./assets/display-widgets/CodeViewer.png" alt="Example of a CodeViewer widget" style="border: 1px solid #D2D5D9">

### Table

Table widgets display array data as rows of a table instead of free-standing components. The `children` parameter defines the values used to render the columns. Similar to the `list` section of the Config Map, only inline widgets should be used as children.

#### Example

```json
{
  "path": "spec.item-list",
  "widget": "Table",
  "children": [{ "path": "name" }, { "path": "status" }]
}
```

<img src="./assets/display-widgets/Table.png" alt="Example of a table widget" style="border: 1px solid #D2D5D9">

### ResourceRefs

ResourceRefs widgets render the lists of links to the associated resources. The corresponding specification object must be an array of objects `{name: 'foo', namespace: 'bar'}`.
Additionally, you must define the kind of the linked resources by passing the Kubernetes resource `kind` (for example, `Secret`, `ConfigMap`).

#### Example

```json
{
  "path": "spec.item-list",
  "widget": "ResourceRefs",
  "kind": "Secret"
}
```

### ControlledBy

ControlledBy widgets render the kind and the name with a link to the resources that the current resource is dependent on.

### Example

```json
{
  "path": "metadata.ownerReferences",
  "widget": "ControlledBy"
}
```

<img src="./assets/display-widgets/ControlledBy.png" alt="Example of a table widget" width="20%" style="border: 1px solid #D2D5D9">

### ControlledByKind

ControlledByKind widgets render the kind of the resources that the current resource is dependent of.

### Example

```json
{
  "path": "metadata.ownerReferences",
  "widget": "ControlledByKind"
}
```

<img src="./assets/display-widgets/ControlledByKind.png" alt="Example of a table widget" width="20%" style="border:1px solid #D2D5D9">
