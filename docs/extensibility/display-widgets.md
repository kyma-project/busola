# Display widgets

Widgets available for lists and details pages.

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

### Badge

Badge widgets render texts as a status badge, using a set of predefined rules to assign colors.

Values that are automatically handled are:

- rendered as an information: initial, pending, available, released
- rendered as a success: ready, bound, running, success, succeeded, ok
- rendered as a warning: unknown, warning
- rendered as an error: error, failure, invalid

#### Example

```json
{
  "path": "status.value",
  "widget": "Badge"
}
```

## Block widgets

Block widgets are more complex layouts and should be used only in details body.

### Plain

Plain widget renders all contents of an object or list sequentially without any decorations. This is the default behaviour for all objects and arrays.

### Panel

Panel widget renders an object as a separate panel with it's own title (base on it's `path` or `name`).

#### Example

```json
{
  "name": "details",
  "widget": "Panel",
  "children": [{ "path": "spec.value" }, { "path": "spec.other-value" }]
}
```

### Columns

Columns widget renders the child widgets in two columns.

#### Example

```json
{
  "name": "columns.container",
  "widget": "Columns",
  "children": [
    {
      "name": "columns.left",
      "widget": "Panel"
    },
    {
      "name": "columns.right",
      "widget": "Panel"
    }
  ]
}
```

### CodeViewer

CodeViewer displays the the value using code hightlight.

#### Widget-specific parameters

- **language** - language to use for code highlighting

#### Example

```json
{
  "path": "spec.json-data",
  "widget": "CodeViewer",
  "language": "json"
}
```

### Table

Table displays array data as rows of a table instead of free-standing components. The `children` parameter defines the column renderers to use. Similar to the `list` section of the config map, only inline widgets should be used as children.

#### Example

```json
{
  "path": "spec.item-list",
  "widget": "Table",
  "children": [{ "path": "name" }, { "path": "status" }]
}
```
