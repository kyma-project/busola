# Customize UI display

- [Resource _list_ overview](#resource-list-overview)
- [Resource _details_ overview](#resource-details-overview)
  - [Header and body parameters](#header-and-body-parameters)
  - [ResourceGraph parameters](#resourcegraph-parameters)
  - [Data scoping](#data-scoping)
- [Inline widgets](#inline-widgets)
  - [Badge](#badge)
  - [ControlledBy](#controlledby)
  - [ExternalLink](#externallink)
  - [ExternalLinkButton](#externallinkbutton)
  - [JoinedArray](#joinedarray)
  - [Labels](#labels)
  - [ResourceButton](#resourcebutton)
  - [ResourceLink](#resourcelink)
  - [Text](#text)
- [Block widgets](#block-widgets)
  - [Alert](#alert)
  - [CodeViewer](#codeviewer)
  - [Columns](#columns)
  - [EventList](#eventlist)
  - [FeaturedCard](#featuredcard)
  - [Panel](#panel)
  - [Plain](#plain)
  - [ResourceList](#resourcelist)
  - [ResourceRefs](#resourcerefs)
  - [Table](#table)
  - [Tabs](#tabs)
- [Widget _injections_ overview](#widget-injections-overview)
  - [Available _injections_ section parameters](#available-injections-section-parameters)
  - [All available _injections_ slots](#all-available-injections-slots)
  - [All available _injections_ locations](#all-available-injections-locations)
  - [_injections_ example](#injections-example)

## Resource _list_ overview

You can customize the resource list by adding objects to the **list** section in your resource ConfigMap.
Each object adds a new column to your table.

### Available _list_ section parameters

- **source** - _[required]_ contains a [JSONata](jsonata.md) expression used to fetch data for the column. In its simplest form, it's the path to the value.
- **widget** - optional widget used to render the field referred to by the **source** property. By default, the value is displayed verbatim.
- **valuePreprocessor** - name of [value preprocessor](resources.md#value-preprocessors).
- **sort** - optional sort option. If set to `true`, it allows you to sort the resource list using this value. Defaults to false. It can also be set to an object with the following properties:
  - **default** - optional flag. If set to `true`, the list view is sorted by this value by default.
  - **compareFunction** - optional [JSONata](jsonata.md) compare function. It is required to use `$first` and `$second` variables when comparing two values. There is a special custom function [compareStrings](jsonata.md#comparestringsfirst-second) used to compare two strings, for example, `$compareStrings($first, $second)`
- **search** - optional search option. If set to `true`, it allows you to search the resource list by this value. Defaults to false. It can also be set to an object with the following property:
  - **searchFunction** - optional [JSONata](jsonata.md) search function. It allows to use `$input` variable to get the search input's value that can be used to search for more complex data.

### Example

```yaml
- source: spec.url
  search: true
  sort:
    default: true
    compareFunction: '$compareStrings($first, $second)'
- source: spec.priority
  widget: Badge
- source: "$join(spec.toppings.name, ', ')"
- name: quantityIsMore
  source:
    '$filter(spec.toppings, function ($v, $i, $a) { $v.quantity > $average($a.quantity)
    })'
- source: "$join(spec.volumes.name, ', ')"
- source: "$filter(spec.volumes, function ($v, $i, $a) {'configMap' in $keys($v)})" # List the array of volume objects that have a ConfigMap
- source: spec.volumes['configMap' in $keys($)] # This is the alternative way of listing the array of volume objects that have a ConfigMap
- source: "$join(spec.volumes['configMap' in $keys($)].name, ', ')" # List volume names of volumes that have a ConfigMap
```

## Resource _details_ overview

The **details** section defines the display structure for the details page.
It contains three optional components, `header`, `body`, and `resourceGraph`.

> **NOTE:** `header` and `body` are arrays of objects, and the `resourceGraph` component is an object.

The first two components are a list of widgets to display in the **header** section and the body of the page respectively.
You can use the `resourceGraph` component to configure the ResourceGraph, which shows relationships between resources.

### Header and body parameters

- **source** - contains a [JSONata](jsonata.md) expression used to fetch data for the widget. In its simplest form, it's the path to the value. Not required for presentational widgets.
- **name** - Name for the primary label of this field. Required for most widgets (except for some rare cases that don't display a label). This can be a key to use from the **translation** section.
- **widget** - optional widget to render the defined entry. By default the value is displayed verbatim.
- **valuePreprocessor** - name of [value preprocessor](resources.md#value-preprocessors).
- **visibility** - by default all fields are visible; however, you can use the **visibility** property to control a single item display.
  - If set to `false` explicitly, the field doesn't render.
  - If set to any string, this property is treated as [JSONata](jsonata.md) format, determining (based on current value given as `$value`) if the field should be visible.
  - If not set, the field always renders.
- **children** - a list of child widgets used for all `object` and `array` fields.

Extra parameters might be available for specific widgets.

### Header and body example

```yaml
header:
  - source: metadata.name
  - source: spec.priority
    widget: Badge
  - source: "$join(spec.volumes.name, ', ')"
body:
  - name: columns
    widget: Columns
    children:
      - name: left-panel
        widget: Panel
      - name: right-panel
        widget: Panel
  - name: summary
    widget: Panel
    children:
      - source: metadata.name
      - source: spec.priority
        widget: Badge
      - name: Volumes names of volumes with config map
        source: "$join(spec.volumes['configMap' in $keys($)].name, ', ')"
  - source: spec.details
    widget: CodeViewer
    language: "'json'"
  - source: spec.configPatches
    widget: Panel
    children:
      - source: applyTo
      - source: match.context
        visibility: '$exists($value.match.context)'
  - source: spec.configPatches
    widget: Table
    children:
      - source: applyTo
      - source: match.context
```

### resourceGraph parameters

- **depth** - defines the maximum distance from the original resource to a transitively related resource. Defaults to `infinity`.
- **colorVariant** - optional integer in range 1 to 11 or `neutral`, denoting the SAP color variant of the node's border. If not set, the node's border is the same as the current text color.
- **networkFlowKind** - optional boolean which determines if the resource should be shown on the network graph, Defaults to `false`, which displays the resource on the structural graph.
- **networkFlowLevel** - optional integer which sets the horizontal position of the resource's node on the network graph.
- **dataSources** - an array of objects in shape:
  - **source** - a string that must correspond to one of the [dataSources](datasources-section.md) name. It selects the related resource and the way it should be matched.

### resourceGraph example

```yaml
details:
  resourceGraph:
    colorVariant: 2
    dataSources:
      - source: relatedSecrets
      - source: relatedPizzaOrders
dataSources:
  relatedSecrets:
    resource:
      kind: Secret
      version: v1
    filter: '$root.spec.recipeSecret = $item.metadata.name'
  relatedPizzaOrders:
    resource:
      kind: PizzaOrder
      group: busola.example.com
      version: v1
    filter: '$item.spec.pizzas[name = $root.metadata.name and namespace = $root.metadata.namespace]'
```

<img src="./assets/ResourceGraph.png" alt="Example of a ResourceGraph"  style="border: 1px solid #D2D5D9">

### Data scoping

Whenever an entry has both **source** and **children** properties, the **children** elements are provided with extra variables.

In the case of objects, a `$root` variable contains the data of the parent element.

For example:

```yaml
- source: spec
  widget: Panel
  children:
    - source: '$root.entry1'
    - source: '$root.entry2'
```

renders the data for `spec.entry1` and `spec.entry2`.

```yaml
- source: spec.data
  widget: Table
  children:
    - source: '$item.name'
    - source: '$item.description'
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
- **highlights** - an optional map of highlight rules. Key refers to the type of highlight, while the rule can just be a plain array of values or a string containing a [JSONata](jsonata.md) rule. Allowed keys are `informative`, `positive`, `warning` and `critical`.
- **description** - a [JSONata](jsonata.md) expression used to fetch additional information that will be displayed in a tooltip when hovering over the badge.
- **copyable** - an optional flag to display a **Copy to clipboard** button next to the widget. By default set to `false`.

#### Default highlight rules

When no highlights are provided, the following values are automatically handled:

- rendered as informative: `initial`, `pending`, `available`, `released`.
- rendered as positive: `ready`, `bound`, `running`, `success`, `succeeded`, `ok`.
- rendered as warning: `unknown`, `warning`.
- rendered as critical: `error`, `failure`, `invalid`.

#### Example

```yaml
- source: status.value
  widget: Badge
  placeholder: '-'
  highlights:
    positive:
      - Running
      - ok
    critical: $item < 0
  description: status.message
```

<img src="./assets/display-widgets/Badge.png" alt="Example of a badge widget" width="40%" style="border: 1px solid #D2D5D9">
<br/><br/>
<img src="./assets/display-widgets/Bagde2.png" alt="Example of a badge widget with a tooltip" width="40%" style="border: 1px solid #D2D5D9">

### ControlledBy

ControlledBy widgets render the kind and the name with a link to the resources that the current resource is dependent on.

#### Widget-specific parameters

- **placeholder** - an optional property to change the default empty text placeholder `-` with a custom string.
  If the **translations** section has a translation entry with the ID that is the same as the **placeholder** string, the translation is used.
- **kindOnly** - used to determine if the resource name is displayed. Defaults to _false_.

#### Examples

##### Kind and name link

```yaml
- source: metadata.ownerReferences
  widget: ControlledBy
  placeholder: '-'
```

<img src="./assets/display-widgets/ControlledBy.png" alt="Example of a ControlledBy widget" width="40%" style="border: 1px solid #D2D5D9">

##### Kind only

```yaml
- source: metadata.ownerReferences
  widget: ControlledBy
  placeholder: '-'
  kindOnly: true
```

<img src="./assets/display-widgets/ControlledBy--kindOnly.png" alt="Example of a ControlledBy widget without name link" width="40%" style="border: 1px solid #D2D5D9">

### ExternalLink

ExternalLink widgets render the link to an external page.

#### Widget-specific parameters

- **link** - an optional [JSONata](jsonata.md) function to generate a custom link. Default value is taken from **source**.
- **copyable** - an optional flag to display a **Copy to clipboard** button next to the widget. By default set to `false`.

#### Examples

##### linkFormula and textFormula usage

```yaml
- source: '$item.port.name'
  name: spec.servers.port.name
  widget: ExternalLink
  link: "'https://' & $item.port.name & ':' & $string($item.port.number)"
```

<img src="./assets/display-widgets/ExternalLink.png" alt="Example of a ExternalLink widget" width="50%" style="border: 1px solid #D2D5D9">

##### Source only

```yaml
- widget: ExternalLink
  source: '$item.hosts'
  name: spec.servers.hosts
```

<img src="./assets/display-widgets/ExternalLink2.png" alt="Example of a ExternalLink widget without linkFormula and textFormula" width="50%" style="border: 1px solid #D2D5D9">

### ExternalLinkButton

ExternalLinkButton widgets render the link to an external page using a button.

#### Widget-specific parameters

- **link** - a required flag to set the target URL.
- **name** - an optional flag. Default value is `Learn More`.

#### Examples

```yaml
- widget: ExternalLinkButton
  link: https://help.sap.com/docs/btp/sap-business-technology-platform/kyma-s-modular-approach
```

<img src="./assets/display-widgets/ExternalLinkButton.png" alt="Example of a ExternalLinkButton widget" width="50%" style="border: 1px solid #D2D5D9">

### JoinedArray

JoinedArray widgets render all the values of an array of strings as a comma-separated list.

#### Widget-specific parameters

- **separator** - a string by which the elements of the array are separated. The default value is a comma `,`. You can use `break` to separate elements with a new line.
- **children** - an optional field to define widgets used for rendering array items. If not provided, the content is rendered as a string.
- **copyable** - an optional flag to display a **Copy to clipboard** button next to the widget. By default set to `false`.

#### Example

```yaml
- name: Joined array
  source: spec.dnsNames
  widget: JoinedArray
  separator: ': '
- name: Joined array
  source: spec.statuses
  widget: JoinedArray
  children:
    - source: $item
      widget: Badge
```

<img src="./assets/display-widgets/JoinedArray.png" alt="Example of a joined array widget" width="20%" style="border: 1px solid #D2D5D9">

### Labels

Labels widgets render all the array or object entries in the `value` or `key-value` format.

#### Widget-specific parameters

- **placeholder** - an optional property to change the default empty text placeholder `-` with a custom string.
  If the **translations** section has a translation entry with the ID that is the same as the **placeholder** string, the translation is used.
- **copyable** - an optional flag to display a **Copy to clipboard** button next to the widget. By default set to `false`.

```yaml
- source: spec.orderDetails
  widget: Labels
  placeholder: '-'
```

<img src="./assets/display-widgets/Labels.png" alt="Example of a Labels widget" width="40%" style="border: 1px solid #D2D5D9">

### ResourceButton

The ResourceButton widgets render a button that links to Kubernetes resources.

#### Widget-specific parameters

- **icon** - The name of an icon for this button. You can find the list of available icons [here](https://sap.github.io/fundamental-react/?path=/docs/component-api-icon--primary). Use string after `--`, for example, if an icon is named `sap-icon--accept`, use `accept`.
- **resource** - To create a hyperlink, Busola needs the name and the kind of the target resource; they must be passed into the **resource** object as property paths in either **\$item** - value extracted using **source**, or **\$root** - the original resource. If the target resource is in a `namespace`, provide **Namespace**, **name**, and **kind** properties.
- **source** - a [JSONata](jsonata.md) expression resolving a link text; this property has access to **\$item** and **\$root**.

#### Example

##### _details_ section

```yaml
- widget: ResourceButton
  source: "metadata.ownerReferences[0].status = 'Running' ? 'otherTranslations.linkText' : 'otherTranslations.errorLinkText'"
  resource:
    name: metadata.ownerReferences[0].name
    namespace: $root.metadata.namespace
    kind: "'Deployment'"
  icon: add
```

<img src="./assets/display-widgets/ResourceButton.png" alt="Example of a ResourceButton widget" width="40%" style="border: 1px solid #D2D5D9">

### ResourceLink

ResourceLink widgets render internal links to Kubernetes resources.

#### Widget-specific parameters

- **resource** - To create a hyperlink, Busola needs the name and the kind of the target resource; they must be passed into the **resource** object as property paths in either **\$item** - value extracted using **source**, or **\$root** - the original resource. If the target resource is in a `namespace`, provide **namespace**, **name**, and **kind** properties.
- **source** - a [JSONata](jsonata.md) expression resolving a link text, this property has access to **\$item** and **\$root**.

#### Example

##### _details_ section

```yaml
- widget: ResourceLink
  source: "metadata.ownerReferences[0].status = 'Running' ? 'otherTranslations.linkText' : 'otherTranslations.errorLinkText'"
  resource:
    name: metadata.ownerReferences[0].name
    namespace: $root.metadata.namespace
    kind: "'Deployment'"
```

<img src="./assets/display-widgets/ResourceLink.png" alt="Example of a ResourceLink widget" width="40%" style="border: 1px solid #D2D5D9">

### Text

Text widgets render values as a simple text. This is the default behavior for all scalar values.

#### Widget-specific parameters

- **placeholder** - an optional property to change the default empty text placeholder `-` with a custom string.
  If the **translations** section has a translation entry with the ID that is the same as the **placeholder** string, the translation is used.
- **copyable** - an optional flag to display a **Copy to clipboard** button next to the widget. By default set to `false`.

#### Example

```yaml
- source: spec.label
  widget: Text
  placeholder: '-'
```

<img src="./assets/display-widgets/Text.png" alt="Example of a text widget" width="40%" style="border: 1px solid #D2D5D9">

## Block widgets

Block widgets are more complex layouts and you must use them only in the details body.

### Alert

Alert widgets display values using predefined types.

#### Widget-specific parameters

- **disableMargin** - an optional boolean which disables the margin outside the alert body.
- **severity** - specifies one of the alert severities: **information**, **warning**, **error**, or **success**. By default, it's set to **information**.

#### Example

```yaml
- source: "'I am some warning for a user'"
  widget: Alert
  severity: warning

- source: "$item.port.number = 80  ? 'Using Default 80' : 'Using Different Port then 80'"
  widget: Alert
  disableMargin: true
```

### CodeViewer

CodeViewer widgets display values using a read-only code editor.

#### Widget-specific parameters

- **language** - a [JSONata](jsonata.md) expression resolving the desired language, used for code highlighting. It has access to the `$root` variable, containing the entire resource. The editor supports languages handled by [Monaco](https://code.visualstudio.com/docs/languages/overview).
  If the language is not specified, the editor tries to display the content as `yaml` with a fallback to `json`.

#### Example

```yaml
- source: spec.json-data
  widget: CodeViewer
  language: "$root.spec.language = 'JavaScript' ? 'javascript' : 'yaml'"
```

<img src="./assets/display-widgets/CodeViewer.png" alt="Example of a CodeViewer widget" style="border: 1px solid #D2D5D9">

### Columns

Columns widgets render the child widgets in multiple columns.

#### Widget-specific parameters

- **inline** - an optional flag to change the layout mode.

  - **true** - list is displayed inline, wrapped if needed. It is a default option for lists, panels, and headers.
  - **false** - list is displayed as a grid.

#### Example

```yaml
- name: columns.container
  widget: Columns
  children:
    - name: columns.left
      widget: Panel
      children:
        - source: spec.value
          placeholder: '-'
    - name: columns.right
      widget: Panel
      children:
        - source: spec.other-value
```

<img src="./assets/display-widgets/Columns.png" alt="Example of a columns widget" style="border: 1px solid #D2D5D9">

### EventList

EventList widget renders a list of Events.

#### Widget-specific parameters

- **filter** - a [JSONata](jsonata.md) function you can use to filter Events emitted by a specific resource. There is a special custom function [matchEvents](jsonata.md#matcheventsitem-kind-name) you can use to filter Events, for example, `$matchEvents($$, $root.kind, $root.metadata.name)`.
- **defaultType** - either `all`, `information` or `warning`. When set to `information` or `warning` Events with specific type are displayed. By default all Events are fetched.
- **hideInvolvedObjects** - optional flag. If set to `true`, the **Involved Objects** column is hidden. Defaults to `false`.

#### Examples

```yaml
- widget: EventList
  filter: '$matchEvents($$, $root.kind, $root.metadata.name)'
  name: events
  defaultType: information
```

<img src="./assets/display-widgets/EventList.png" alt="Example of a EventList widget" style="border: 1px solid #D2D5D9">

---

```yaml
- widget: EventList
  filter: '$matchEvents($$, $root.kind, $root.metadata.name)'
  name: events
  defaultType: information
  hideInvolvedObjects: true
```

<img src="./assets/display-widgets/EventListHiddenField.png" alt="Example of a EventList widget with hidden involved objects" style="border: 1px solid #D2D5D9">

### FeaturedCard

FeaturedCard widgets render a promotional banner with its own title, description, and a maximum of 2 additional children.
The FeaturedCard can be closed in the top right corner.
It is important to select a unique ID for each FeaturedCard, since it will be displayed/hidden based on its ID.

#### Example

```yaml
- title: Introducing Modules
  description: Modules add functionalities to your cluster. Consume SAP BTP services, monitor your cluster, build serverless applications and more.
  widget: FeaturedCard
  id: ModulesBanner
  children:
    - widget: Wizard
      name: Add Modules
      wizard: module-wizard
    - widget: ExternalLinkButton
      link: https://help.sap.com/docs/btp/sap-business-technology-platform/kyma-s-modular-approach
```

<img src="./assets/display-widgets/FeaturedCard.png" alt="Example of a FeaturedCard widget" style="border: 1px solid #D2D5D9">

#### Widget-specific parameters

- **title** - an optional string that renders a title after an image.
- **subtitle** - an optional string that renders a subtitle.

### Panel

Panel widgets render an object as a separate panel with its own title (based on its `source` or `name`).

#### Example

```yaml
- name: Details
  widget: Panel
  description: To check the extensibility documentation go to the {{[Busola page](https://github.com/kyma-project/busola/tree/main/docs/extensibility)}}.
  children:
    - source: spec.value
    - source: spec.other-value
      placeholder: '-'
- source: spec
  widget: Panel
  children:
    - source: '$parent.entry1'
    - source: '$parent.entry2'
```

<img src="./assets/display-widgets/Panel.png" alt="Example of a panel widget" style="border: 1px solid #D2D5D9">

#### Widget-specific parameters

- **header** - an optional array that allows you to, for example, display labels in the panel header.
- **disablePadding** - an optional boolean which disables the padding inside the panel body.
- **description** - displays a custom description on the resource list page. It can contain links. If the **translations** section has a translation entry with the ID that is the same as the **description** string, the translation is used.
- **decodable** - decodes the values of all the children using base64 - must be used together with the **source** parameter.

#### Example

```yaml
- widget: Panel
  name: spec.selector
  children:
    - source: '$podSelector()'
      widget: ResourceList
  header:
    - source: spec.selector
      widget: Labels
      name: spec.selector
      visibility: spec.selector
- widget: Secret
  source: '$secret().data'
  decodable: true
  children:
    - source: secret_id
    - source: secret_name
```

### Plain

Plain widgets render all contents of an object or list sequentially without any decorations. This is the default behavior for all objects and arrays.

### ResourceList

ResourceList widgets render a list of Kubernetes resources. The ResourceList widgets should be used along with the [related resources](datasources-section.md).

#### Widget-specific parameters

- **children** optional field used to obtain custom columns. If not set, the configuration is reused based on the existing resource list, defined in Busola or using extensibility.
- **sort** - optional sort option. It's an array of objects that allows you to sort by the value from the given **source**.
  - **source** - _[required]_ contains a [JSONata](jsonata.md) expression used to fetch data for the column. In its simplest form, it's the path to the value.
  - **default** - optional flag. If set to `true`, the list view is sorted by this value by default.
  - **compareFunction** - optional [JSONata](jsonata.md) compare function. It is required to use `$first` and `$second` variables when comparing two values. There is a special custom function [compareStrings](jsonata.md#comparestringsfirst-second) used to compare two strings, for example, `$compareStrings($first, $second)`
- **search** - optional search option. It's an array of objects that allows you to search for resources including the value from the given **source**.
  - **source** - _[required]_ contains a [JSONata](jsonata.md) expression used to fetch data for the column. In its simplest form, it's the path to the value.
  - **searchFunction** - optional [JSONata](jsonata.md) search function. It allows you to use the `$input` variable to get the search input's value that can be used to search for more complex data.

Since the **ResourceList** widget does more than just list the items, you must provide the whole data source (`$myResource()`) instead of just the items (`$myResource().items`).

#### Examples

```yaml
- widget: ResourceList
  source: '$myDeployments()'
  name: Example ResourceList Deployments
  sort:
    - source: spec.replicas
      compareFunction: '$second - $first'
    - source: spec.strategy.type
      compareFunction: '$compareStrings($second, $first)'
      default: true
  search:
    - source: spec.replicas
    - source: spec.containers
      searchFunction: '$filter(spec.containers, function($c){ $contains($c.image, $input) })'
```

<img src="./assets/display-widgets/ResourceList.png" alt="Example of a ResourceList widget" style="border: 1px solid #D2D5D9">

---

```yaml
- widget: ResourceList
  path: '$mySecrets'
  name: Example ResourceList Secret with children
  children:
    - source: '$item'
      name: Name
      sort: 'true'
      widget: ResourceLink
      resource:
        name: $item.metadata.name
        namespace: root.metadata.namespace
        kind: $item.kind
    - source: type
      name: Type
      search: true
      sort:
        default: true
```

<img src="./assets/display-widgets/ResourceListChildren.png" alt="Example of a ResourceList widget with children" style="border: 1px solid #D2D5D9">

### ResourceRefs

ResourceRefs widgets render the lists of links to the associated resources. The corresponding specification object must be an array of objects `{name: 'foo', namespace: 'bar'}`.

#### Widget-specific parameters

- **kind** - _[required]_ Kubernetes kind of the resource.

#### Example

```yaml
- source: spec.item-list
  widget: ResourceRefs
  kind: Secret
```

<img src="./assets/display-widgets/ResourceRefs.png" alt="Example of a ResourceRefs widget" style="border: 1px solid #D2D5D9">

### Table

Table widgets display array data as rows of a table instead of free-standing components. The **children** parameter defines the values used to render the columns. Similar to the **list** section of the ConfigMap, you should use inline widgets only as children.

#### Widget-specific parameters

- **collapsible** - an optional array of extra widgets to display as an extra collapsible section. Uses the same format as the **children** parameter.
- **collapsibleTitle** - an optional option for **collapsible** to define title for the collapsible sections, as string or the [JSONata](jsonata.md) function.
- **disablePadding** - an optional boolean which disables the padding inside the panel body.
- **showHeader** - an optional boolean which disables displaying the head row.
- **extraHeaderContent** - an optional array of extra widgets to display as an action section. Uses the same format as the **children** parameter.
- **sort** - optional sort option. If set to `true`, it allows you to sort using this value. Defaults to false. It can also be set to an object with the following properties:
  - **default** - optional flag. If set to `true`, the list view is sorted by this value by default.
  - **compareFunction** - optional [JSONata](jsonata.md) compare function. It is required to use `$first` and `$second` variables when comparing two values. There is a special custom function [compareStrings](jsonata.md#comparestringsfirst-second) used to compare two strings, for example, `$compareStrings($first, $second)`
- **search** - optional search option. If set to `true`, it allows you to search the resource list by this value. Defaults to false. It can also be set to an object with the following property:
  - **searchFunction** - optional [JSONata](jsonata.md) search function. It allows you to use the `$input` variable to get the search input's value that can be used to search for more complex data.

#### Example

```yaml
- source: spec.toppings
  widget: Table
  collapsibleTitle: "'Topping #' & $string($index + 1) & (' ' & $join($keys($item), ' '))"
  collapsible:
    - source: quantity
  children:
    - source: name
      sort: true
    - source: price
      sort:
        default: true
        compareFunction: '$second -$first'
      search:
        searchFunction: '$filter($item.price, function($p){ $p > $number($input) }'
```

<img src="./assets/display-widgets/Table.png" alt="Example of a table widget" style="border: 1px solid #D2D5D9">

### Tabs

Tabs widgets render the child widgets in multiple tabs.

#### Example

```yaml
- widget: Tabs
  children:
    - name: General
      children:
        - widget: Panel
          name: Overview
          source: '...'
    - name: Resources
      children:
        - widget: ResourceRefs
          source: '...'
```

<img src="./assets/display-widgets/Tabs.png" alt="Example of a tabs widget" style="border: 1px solid #D2D5D9">

## Widget _injections_ overview

The **Injections** section contains a list of objects that defines the display structure of the current extension on a different view. Each object is a separate **injection** that will be injected on a specified view at a specified slot.

### Available _injections_ section parameters

- **source** - _[required]_ contains a [JSONata](jsonata.md) expression used to fetch data for the column. In its simplest form, it's the path to the value.
- **name** - an optional name for the field instead of the default capitalized last part of the path. This can be a key from the **translation** section.
- **widget** - an optional widget used to render the field referred to by the **source** property. The widget should be adjusted to handle arrays.
- **order** - a number that defines in what order injections will be rendered. If one or more injections have the same order, they will be sorted by name.
- **targets** - an array of targets
  - **location** - _[required]_ defines on what view the injection should be rendered. Currently, injections are rendered only on details views. For more information, check the list of [all available locations](#all-available-injections-locations)
  - **slot** - _[required]_ defines where the injection should be rendered on a page. Check the list of [all available slots](#all-available-injections-slots)
  - **filter** - a JSONata expression that filters resources based on a given condition. If defined, it overrides the general filter.
- **filter** - a JSONata expression that filters resources based on a given condition. This is a general filter rule. If **filter** is defined in **targets**, it will be ignored.

### All available _injections_ slots

- **details-bottom** - At the bottom of the resource view
- **details-header** - In the header of the details view
- **details-top** - At the top of the resource view
- **list-header** - In the header of the list view

### All available _injections_ locations

#### Special views

- ClusterOverview (only supports the **details-\*** slots)
- CustomResourceDefinitions

#### Resource views

- Certificates
- ClusterRoleBindings
- ClusterRoles
- ConfigMaps
- CronJobs
- DaemonSets
- Deployments
- Events
- HorizontalPodAutoscalers
- Ingresses
- Jobs
- Namespaces
- NetworkPolicies
- OAuth2Clients
- PersistentVolumeClaims
- PersistentVolumes
- Pods
- ReplicaSets
- RoleBindings
- Roles
- Secrets
- ServiceBindings
- ServiceInstances
- Services
- StatefulSets

#### Extension views

Use a lowercase pluralized **general.resource.kind** as the **location** for injections into resources handled by another extension.

### _injections_ example

```
injections: |-
  - name: Failing API Rules
    widget: Table
    source: \$root
    targets:
      - slot: details-top
        location: ClusterOverview
      - slot: details-bottom
        location: ClusterOverview
        filter: '$item.status.APIRuleStatus.code="OK"'
    filter: '$item.status.APIRuleStatus.code="ERROR"'
    order: 2
    children:
      - name: Name
        source: metadata.name
        widget: Text
      - name: Namespace
        source: metadata.namespace
        widget: Text
      - name: status
        widget: Badge
        highlights:
          positive:
            - 'OK'
          critical:
            - 'ERROR'
            - 'SKIPPED'
        source: 'status.APIRuleStatus.code ? status.APIRuleStatus.code : "UNKNOWN"'
        description: status.APIRuleStatus.desc
```

Here's an example of an injection for a wizard in the function view:

```
injections: |-
  - name: Get started with functions
    widget: Wizard
    wizard: serverless-wizard
    targets:
      - location: functions
        slot: list-header
```
