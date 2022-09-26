# _dataSources_ section

The optional **dataSources** section contains an object that maps a data source name to a data source configuration object. The data source name, preceded by a dollar sign '\$', is used in the **source** expression.

Data sources are provided in all [JSONata](https://docs.jsonata.org/overview.html) formulas as functions to call. For example, `{ "source": $myRelatedResource().metadata.labels }` returns the `metadata.labels` of the related resource.

When you provide the whole request, you can access individual resources using the `items` field, for example `{ "widget": "Table", "source": "$myRelatedResources().items" }`.

## Data source configuration object fields

Busola uses the following fields to build the related resource URL and filter the received data.

- **resource**:
  - **kind** - _[required]_ Kubernetes resource kind.
  - **group** - Kubernetes resource group. Not provided for Kubernetes resources in the core (also called legacy) group.
  - **version** - _[required]_ Kubernetes resource version.
  - **namespace** - the resource's Namespace name; it defaults to the original resource's Namespace. If set to `null`, cluster-wide resources or resources in all Namespaces are matched.
  - **name** - a specific resource name; leave empty to match all resources of a given type.
- **ownerLabelSelectorPath** - the path to original object's **selector** type property; for example, `spec.selector.matchLabels` for Deployment, used to select matching Pods.
- **filter** - [JSONata](https://docs.jsonata.org/overview.html) function enabling the user to write a custom matching logic. It uses the following variables:

  - **item** - the current item of the related kind.
  - **root** - the original resource.

  This function should return a boolean value.
  You can also use the [`matchByLabelSelector` function](jsonata.md#matchbylabelselectoritem-selectorpath) to see the matched Pods. To do that, provide the Pods as `$item`, and path to the labels.

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
