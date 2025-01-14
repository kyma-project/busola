# Configure the dataSources Section

The optional **dataSources** section contains an object that maps a data source name to a data source configuration object. The data source name, preceded by a dollar sign `$`, is used in the **source** expression.

Data sources are provided in all [JSONata](100-jsonata.md) formulas as functions to call. For example, `{ "source": $myRelatedResource().metadata.labels }` returns the `metadata.labels` of the related resource.

When you provide the whole request, you can access individual resources using the `items` field, for example `{ "widget": "Table", "source": "$myRelatedResources().items" }`.

## Available Parameters

| Parameter                  | Required | Type                             | Description                                                                                                                                                                                                                                                                                                                                                                                                                      |
|----------------------------|----------|----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **resource**               | **Yes**  |                                  | A resource defined based on the following properties:                                                                                                                                                                                                                                                                                                                                                                            |
| **resource.kind**          | **Yes**  | string                           | A Kubernetes resource kind.                                                                                                                                                                                                                                                                                                                                                                                                      |
| **resource.version**       | **Yes**  | string                           | A Kubernetes resource version.                                                                                                                                                                                                                                                                                                                                                                                                   |
| **resource.name**          | No       | string                           | A resource name. If left empty, all resources of a given type are matched.                                                                                                                                                                                                                                                                                                                                                       |
| **resource.group**         | No       | string                           | A Kubernetes resource group. It's not provided for the Kubernetes resources in the core (legacy) group.                                                                                                                                                                                                                                                                                                                          |
| **resource.namespace**     | No       | string                           | The name of the resource's namespace. It defaults to the original resource's namespace. If set to `null`, cluster-wide resources or resources in all namespaces are matched.                                                                                                                                                                                                                                                     |
| **ownerLabelSelectorPath** | No       |                                  | The path to original object's selector type property. For example, `spec.selector.matchLabels` for Deployment, used to select matching Pods.                                                                                                                                                                                                                                                                                     |
| **filter**                 | No       | [JSONata](100-jsonata.md) expression | It allows you to write a custom matching logic. It uses the `item` variable to point to the current item of the related kind, and the `root` variable to point to the original resource. It returns a boolean value. You can also filter using the [`matchByLabelSelector` function](101-preset-functions.md#matchbylabelselectoritem-selectorpath) to see the matched Pods. To do that, provide the Pods as `$item`, and path to the labels. |

## Examples

```yaml
details:
  body:
    - widget: ResourceList
      source: '$myPods()'
dataSources:
  myPods:
    resource:
      kind: Pod
      version: v1
    ownerLabelSelectorPath: spec.selector.matchLabels
```

```yaml
details:
  body:
    - widget: ResourceList
      path: '$mySecrets'
dataSources:
  mySecrets:
    resource:
      kind: Secret
      version: v1
      namespace:
    filter:
      '$root.spec.secretName = $item.metadata.name and $root.metadata.namespace
      = $item.metadata.namespace'
```

```yaml
podSelector:
  resource:
    kind: Pod
    version: v1
  filter: '$matchByLabelSelector($item, $root.spec.selector)'
```
