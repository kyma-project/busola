# Configure a Details Page

You can customize the details page of the user interface component of your resource by adding objects to the **data.details** section in your resource ConfigMap.

## Available Parameters

In the **data.details** section you can provide configuration of four optional components: **header**, **body**, **status**, **health** and **resourceGraph**. The **header**, **status**, **body** and **health** components are lists of widgets visible in the respective sections of the details page. You can use the **resourceGraph** component to present the relationship between different resources.

### **header**, **status**, **body** and **health** Parameters

This table lists the available parameters of the **data.details.header**, **data.details.status**, **data.details.health** and/or **data.details.body** section in your resource ConfigMap. You can learn whether each of the parameters is required and what purpose it serves. The **data.details.header**, **data.details.status**, **data.details.health** and **data.details.body** components are arrays of objects.

| Parameter             | Required | Type                                        | Description                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------- | -------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **source**            | **Yes**  | string or [JSONata](jsonata.md) expression  | Used to fetch data for the widget. In its simplest form, it's the path to the value. Not required for presentational widgets.                                                                                                                                                                                                                                                                                    |
| **name**              | **Yes**  | string                                      | Name for the primary label of this field. Required for most widgets (except for some rare cases that don't display a label). This can be a key to use from the [**translation** section](./translations-section.md).                                                                                                                                                                                             |
| **widget**            | No       | string                                      | A widget to render the defined entry. By default the value is displayed verbatim. For more information about the available widgets, see [List and Details Widgets](./50-list-and-details-widgets.md).                                                                                                                                                                                                            |
| **valuePreprocessor** | No       | string                                      | Name of the [value preprocessor](resources.md#value-preprocessors).                                                                                                                                                                                                                                                                                                                                              |
| **visibility**        | No       | boolean or [JSONata](jsonata.md) expression | By default all fields are visible; however, you can use the **visibility** property to control a single item display. <br>- If set to `false` explicitly, the field doesn't render. <br> - If set to any string, this property is treated as [JSONata](jsonata.md) format, determining if the field should be visible based on the current value given as `$value`. <br> - If not set, the field always renders. |
| **children**          | No       | []objects                                   | A list of child widgets used for all `object` and `array` fields.                                                                                                                                                                                                                                                                                                                                                |

Extra parameters might be available for specific widgets.

See the following examples:

```yaml
details:
  header:
    - source: metadata.name
    - source: spec.priority
      widget: Badge
    - source: "$join(spec.volumes.name, ', ')"
  status:
    - name: Replicas
      source: status.replicas
    - name: Condition details
      widget: ConditionList
      source: status.conditions
  health:
    - name: MyTitle
      widget: StatisticalCard
      source: status
      mainValue:
        name: MySubtitle
        source: $item.importantValue
      children:
        - name: ExtraInformation1
          source: $item.value1
        - name: ExtraInformation2
          source: $item.value2
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

### Data Scoping

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

### **resourceGraph** Parameters

This table lists the available parameters of the **data.details.resourceGraph** section in your resource ConfigMap. You can learn whether each of the parameters is required and what purpose it serves. The **resourceGraph** component is an object.

| Parameter              | Required | Type      | Description                                                                                                                                                                   |
| ---------------------- | -------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **depth**              | **Yes**  | string    | Defines the maximum distance from the original resource to a transitively related resource. Defaults to `infinity`.                                                           |
| **colorVariant**       | No       | integer   | Denotes the SAP color variant of the node's border. Its value must be in range `1` to `11` or `neutral`. If not set, the node's border is the same as the current text color. |
| **networkFlowKind**    | No       | boolean   | Determines if the resource should be shown on the network graph. Defaults to `false`, which displays the resource on the structural graph.                                    |
| **networkFlowLevel**   | No       | integer   | Sets the horizontal position of the resource's node on the network graph.                                                                                                     |
| **dataSources**        | No       | []objects | A list of the **dataSources** used in the graph.                                                                                                                              |
| **dataSources.source** | No       | string    | The value must correspond to one of the [dataSources](datasources-section.md) names. It selects the related resource and the way it should be matched.                        |

See the following examples:

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

## Related Links

- [Widgets available for the list and details pages](./50-list-and-details-widgets.md)
