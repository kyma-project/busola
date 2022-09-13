# Display widgets

- [Resource _list_ overview](#resource-list-overview)
- [Resource _details_ overview](#resource-details-overview)
  - [Header and body parameters](#header-and-body-parameters)
  - [ResourceGraph parameters](#resourcegraph-parameters)
  - [Data scoping](#data-scoping)
- [Inline widgets](#inline-widgets)
  - [Badge](#badge)
  - [ControlledBy](#controlledby)
  - [JoinedArray](#joinedarray)
  - [Labels](#labels)
  - [ResourceLink](#resourcelink)
  - [Text](#text)
- [Block widgets](#block-widgets)
  - [CodeViewer](#codeviewer)
  - [Columns](#columns)
  - [Panel](#panel)
  - [Plain](#plain)
  - [ResourceList](#resourcelist)
  - [ResourceRefs](#resourcerefs)
  - [Table](#table)

## Resource _list_ overview

You can customize the resource list by adding objects to the **list** section in your resource ConfigMap.
Each object adds a new column to your table.

### Available _list_ section parameters

- **source** - _[required]_ contains a [JSONata](https://docs.jsonata.org/overview.html) expression used to fetch data for the column. In its simplest form, it's the path to the value.
- **widget** - optional widget used to render the field referred to by the **source** property. By default, the value is displayed verbatim.
- **valuePreprocessor** - name of [value preprocessor](resources.md#value-preprocessors).
- **sort** - optional sort option. If set to `true`, it allows you to sort the resource list using this value. Defaults to false. It can also be set to an object with the following properties:
  - **default** - optional flag. If set to `true`, the list view is sorted by this value by default.
  - **compareFunction** - optional [JSONata](https://docs.jsonata.org/overview.html) compare function. It is required to use `$first` and `$second` variables when comparing two values. There is a special custom function [compareStrings](jsonata.md#comparestringsfirst-second) used to compare two strings, for example, `$compareStrings($first, $second)`

### Example

```json
[
  {
    "source": "spec.url",
    "sort": {
      "default": true,
      "compareFunction": "$compareStrings($first, $second)"
    }
  },
  { "source": "spec.priority", "widget": "Badge" },
  { "source": "$join(spec.toppings.name, ', ')" },
  {
    "name": "quantityIsMore",
    "source": "$filter(spec.toppings, function ($v, $i, $a) { $v.quantity > $average($a.quantity) })"
  },
  { "source": "$join(spec.volumes.name, ', ')" },
  {
    "source": "$filter(spec.volumes, function ($v, $i, $a) {'configMap' in $keys($v)})" // List the array of Volume objects that have a config map
  },
  {
    "source": "spec.volumes['configMap' in $keys($)]" // This is the alternative way of listing the array of Volume objects that have a config map
  },
  {
    "source": "$join(spec.volumes['configMap' in $keys($)].name, ', ')" // List volume names of volumes that have a config map
  }
]
```

## Resource _details_ overview

The **details** section defines the display structure for the details page.
It contains three components, `header`, `body`, and optional `resourceGraph`.
The first two components are a list of widgets to display in the **header** section and the body of the page respectively.
The `resourceGraph` component is used to configure the ResourceGraph which shows relationships between various resources.

### Header and body parameters

- **source** - contains a [JSONata](https://docs.jsonata.org/overview.html) expression used to fetch data for the widget. In its simplest form, it's the path to the value. Not required for presentational widgets.
- **name** - Name for the primary label of this field. Required for most widgets (except for some rare cases that don't display a label). This can be a key to use from the **translation** section.
- **widget** - optional widget to render the defined entry. By default the value is displayed verbatim.
- **valuePreprocessor** - name of [value preprocessor](resources.md#value-preprocessors).
- **visibility** - by default all fields are visible; however **visibility** property can be used to control a single item display.
  - If set to `false` explicitly, the field doesn't render.
  - If set to any string, this property is treated as JSONata format, determining (based on current value given as `data`) if the field should be visible.
  - If not set, the field always renders.
- **children** - a list of child widgets used for all `object` and `array` fields.

Extra parameters might be available for specific widgets.

### Header and body example

```json
{
  "header": [
    { "source": "metadata.name" },
    { "source": "spec.priority", "widget": "Badge" },
    { "source": "$join(spec.volumes.name, ', ')" }
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
        { "source": "metadata.name" },
        { "source": "spec.priority", "widget": "Badge" },
        {
          "name": "Volumes names of volumes with config map",
          "source": "$join(spec.volumes['configMap' in $keys($)].name, ', ')"
        }
      ]
    },
    {
      "source": "spec.details",
      "widget": "CodeViewer",
      "language": "json"
    },
    {
      "source": "spec.configPatches",
      "widget": "Panel",
      "children": [
        { "source": "applyTo" },
        {
          "source": "match.context",
          "visibility": "$exists(data.match.context)"
        }
      ]
    },
    {
      "source": "spec.configPatches",
      "widget": "Table",
      "children": [{ "source": "applyTo" }, { "source": "match.context" }]
    }
  ]
}
```

### resourceGraph parameters

- **depth** - defines the maximum distance from the original resource to a transitively related resource. Defaults to infinity.
- **colorVariant** - optional integer in range 1 to 11 or 'neutral', denoting the SAP color variant of the node's border. If not set, the node's border is the same as the current text color.
- **networkFlowKind** - optional boolean which determines if the resource should be shown on the network graph, Defaults to `false`, which displays the resource on the structural graph.
- **networkFlowLevel** - optional integer which sets the horizontal position of the resource's node on the network graph.
- **dataSources** - an array of objects in shape:
  - **source** - a string that must correspond to one of the [dataSources](resources.md#datasources-section) name. It selects the related resource and the way it should be matched.

### resourceGraph example

```json
{
  "details": {
    "resourceGraph": {
      "colorVariant": 2,
      "dataSources": [
        {
          "source": "relatedSecrets"
        },
        {
          "source": "relatedPizzaOrders"
        }
      ]
    }
  },
  "dataSources": {
    "relatedSecrets": {
      "resource": {
        "kind": "Secret",
        "version": "v1"
      },
      "filter": "$root.spec.recipeSecret = $item.metadata.name"
    },
    "relatedPizzaOrders": {
      "resource": {
        "kind": "PizzaOrder",
        "group": "busola.example.com",
        "version": "v1"
      },
      "filter": "$item.spec.pizzas[name = $root.metadata.name and namespace = $root.metadata.namespace]"
    }
  }
}
```

<img src="./assets/ResourceGraph.png" alt="Example of a ResourceGraph"  style="border: 1px solid #D2D5D9">

### Data scoping

Whenever an entry has both **source** and **children** properties, the **children** elements are provided with extra variables.

In the case of objects, a `$parent` variable contains the data of the parent element.

For example:

```json
[
  {
    "source": "spec",
    "widget": "Panel",
    "children": [{ "source": "$parent.entry1" }, { "source": "$parent.entry2" }]
  }
]
```

renders the data for `spec.entry1` and `spec.entry2`.

In the case of array-based components, an `$item` variable contains data for each child. For example:

```json
[
  {
    "source": "spec.data",
    "widget": "Table",
    "children": [{ "source": "$item.name" }, { "source": "$item.description" }]
  }
]
```

renders `spec.data[].name` and `spec.data[].description`.

---

You can use display widgets in the lists and details pages.

## Inline widgets

Use inline widgets for simple values in lists, details headers, and details bodies.

### Badge

Badge widgets render texts as a status badge, using a set of predefined rules to assign colors.

#### Widget-specific parameters

- **placeholder** - an optional property to change the default empty text placeholder `-` with a custom string.
  If the **translations** section has a translation entry with the ID that is the same as the **placeholder** string, the translation is used.
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
  "source": "status.value",
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
  If the **translations** section has a translation entry with the ID that is the same as the **placeholder** string, the translation is used.
- **kindOnly** - used to determine if the resource name is displayed. Defaults to _false_.

#### Examples

##### Kind and name link

```json
{
  "source": "metadata.ownerReferences",
  "widget": "ControlledBy",
  "placeholder": "-"
}
```

<img src="./assets/display-widgets/ControlledBy.png" alt="Example of a ControlledBy widget" width="50%" style="border: 1px solid #D2D5D9">

##### Kind only

```json
{
  "source": "metadata.ownerReferences",
  "widget": "ControlledBy",
  "placeholder": "-",
  "kindOnly": true
}
```

<img src="./assets/display-widgets/ControlledBy--kindOnly.png" alt="Example of a ControlledBy widget without name link" width="50%" style="border: 1px solid #D2D5D9">

### JoinedArray

JoinedArray widgets render all the values of an array of strings as a comma-separated list.

#### Example

```json
{
  "name": "Joined array",
  "source": "spec.dnsNames",
  "widget": "JoinedArray",
  "separator": ": "
}
```

<img src="./assets/display-widgets/JoinedArray.png" alt="Example of a joined array widget" width="20%" style="border: 1px solid #D2D5D9">

#### Widget-specific parameters

- **separator** - a string by which the elements of the array are separated. The default value is a comma `,`. You can use `break` to separate elements with a new line.

### Labels

Labels widgets render all the array or object entries in the `value` or `key-value` format.

#### Widget-specific parameters

- **placeholder** - an optional property to change the default empty text placeholder `-` with a custom string.
  If the **translations** section has a translation entry with the ID that is the same as the **placeholder** string, the translation is used.

```json
{
  "source": "spec.orderDetails",
  "widget": "Labels",
  "placeholder": "-"
}
```

<img src="./assets/display-widgets/Labels.png" alt="Example of a Labels widget" width="20%" style="border: 1px solid #D2D5D9">

### ResourceLink

ResourceLink widgets render internal links to Kubernetes resources.

#### Widget-specific parameters

- **resource** - To create a hyperlink, Busola needs the name and the kind of the target resource; they must be passed into the **resource** object as property paths in either **data** - value extracted using **source**, or **root** - the original resource. If the target resource is in a `namespace`, provide **namespace**, **name**, and **kind** properties.
- **linkText** - this property has access to **data** and **root**. This makes it possible to insert resource properties into a translation.

#### Example

##### _details_ section

```json
{
  "widget": "ResourceLink",
  "source": "metadata.ownerReferences[0]",
  "linkText": "otherTranslations.linkText",
  "resource": {
    "name": "data.name",
    "namespace": "root.metadata.namespace",
    "kind": "'Deployment'"
  }
}
```

<img src="./assets/display-widgets/ResourceLink.png" alt="Example of a ResourceLink widget" style="border: 1px solid #D2D5D9">

##### _translations_ section

```yaml
en:
  otherTranslations.linkText: Go to {{data.kind}} {{data.name}}.
```

### Text

Text widgets render values as a simple text. This is the default behavior for all scalar values.

#### Widget-specific parameters

- **placeholder** - an optional property to change the default empty text placeholder `-` with a custom string.
  If the **translations** section has a translation entry with the ID that is the same as the **placeholder** string, the translation is used.

#### Example

```json
{
  "source": "spec.label",
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
  "source": "spec.json-data",
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
      "children": [{ "source": "spec.value", "placeholder": "-" }]
    },
    {
      "name": "columns.right",
      "widget": "Panel",
      "children": [{ "source": "spec.other-value" }]
    }
  ]
}
```

<img src="./assets/display-widgets/Columns.png" alt="Example of a columns widget" style="border: 1px solid #D2D5D9">

### Panel

Panel widgets render an object as a separate panel with its own title (based on its `source` or `name`).

#### Example

```json
[
  {
    "name": "details",
    "widget": "Panel",
    "children": [
      { "source": "spec.value" },
      { "source": "spec.other-value", "placeholder": "-" }
    ]
  },
  {
    "source": "spec",
    "widget": "Panel",
    "children": [{ "source": "$parent.entry1" }, { "source": "$parent.entry2" }]
  }
]
```

<img src="./assets/display-widgets/Panel.png" alt="Example of a panel widget" style="border: 1px solid #D2D5D9">

#### Widget-specific parameters

- **header** - an optional array that allows you to, for example, display labels in the panel header.
- **disablePadding** - an optional boolean which disables the padding inside the panel body.

#### Example

```json
{
  "widget": "Panel",
  "name": "spec.selector",
  "children": [
    {
      "source": "$podSelector()",
      "widget": "ResourceList"
    }
  ],
  "header": [
    {
      "source": "spec.selector",
      "widget": "Labels",
      "name": "spec.selector",
      "visibility": "spec.selector"
    }
  ]
}
```

### Plain

Plain widgets render all contents of an object or list sequentially without any decorations. This is the default behavior for all objects and arrays.

### ResourceList

ResourceList widgets render a list of Kubernetes resources. The ResourceList widgets should be used along with [related resources](resources.md#datasources-section).

#### Widget-specific parameters

- **children** optional field used to obtain custom columns. If not set, the configuration is reused based on the existing resource list defined in Busola.
- **sort** - optional sort option. It's an array of objects that allows you to sort by the value from the given **source**.
  - **source** - _[required]_ contains a [JSONata](https://docs.jsonata.org/overview.html) expression used to fetch data for the column. In its simplest form, it's the path to the value.
  - **default** - optional flag. If set to `true`, the list view is sorted by this value by default.
  - **compareFunction** - optional [JSONata](https://docs.jsonata.org/overview.html) compare function. It is required to use `$first` and `$second` variables when comparing two values. There is a special custom function [compareStrings](jsonata.md#comparestringsfirst-second) used to compare two strings, for example, `$compareStrings($first, $second)`

Since the **ResourceList** widget does more than just list the items, you must provide the whole data source (`$myResource()`) instead of just the items (`$myResource().items`).

#### Examples

```json
{
  "widget": "ResourceList",
  "source": "$myDeployments()",
  "name": "Example ResourceList Deployments",
  "sort": [
    {
      "source": "spec.replicas",
      "compareFunction": "$second - $first"
    },
    {
      "source": "$item.spec.strategy.type",
      "compareFunction": "$compareStrings($second, $first)",
      "default": true
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
      "source": "$item",
      "name": "Name",
      "sort": "true",
      "widget": "ResourceLink",
      "resource": {
        "name": "data.metadata.name",
        "namespace": "root.metadata.namespace",
        "kind": "data.kind"
      }
    },
    {
      "source": "type",
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
  "source": "spec.item-list",
  "widget": "ResourceRefs",
  "kind": "Secret"
}
```

<img src="./assets/display-widgets/ResourceRefs.png" alt="Example of a ResourceRefs widget" style="border: 1px solid #D2D5D9">

### Table

Table widgets display array data as rows of a table instead of free-standing components. The **children** parameter defines the values used to render the columns. Similar to the **list** section of the ConfigMap, you should use inline widgets only as children.

#### Widget-specific parameters

- **collapsible** - an optional array of extra widgets to display as an extra collapsible section. Uses the same format as the **children** parameter.
- **sort** - optional sort option. If set to `true`, it allows you to sort using this value. Defaults to false. It can also be set to an object with the following properties:
  - **default** - optional flag. If set to `true`, the list view is sorted by this value by default.
  - **compareFunction** - optional [JSONata](https://docs.jsonata.org/overview.html) compare function. It is required to use `$first` and `$second` variables when comparing two values. There is a special custom function [compareStrings](jsonata.md#comparestringsfirst-second) used to compare two strings, for example, `$compareStrings($first, $second)`

#### Example

```json
{
  "source": "spec.toppings",
  "widget": "Table",
  "collapsible": [{ "source": "quantity" }],
  "children": [
    { "source": "$item.name", "sort": true },
    {
      "source": "$item.price",
      "sort": { "default": true, "compareFunction": "$second -$first" }
    }
  ]
}
```

<img src="./assets/display-widgets/Table.png" alt="Example of a table widget" style="border: 1px solid #D2D5D9">
