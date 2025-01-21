# JSONata Preset Functions for Resource-Based Extensions

## canI (resourceGroupAndVersion, resourceKind)

You can use the **canI** function to determine if a user has access rights to list a specified resource. The function comes with the following parameters:

- **resourceGroupAndVersion**: Determines the first part of a resource URL following the pattern: `${resource group}/${resource version}`.
- **resourceKind**: Describes a resource kind.

### Example

```yaml
- path: spec.gateway
  name: gateway
  visibility: $not($canI('networking.istio.io/v1beta1', 'Gateway'))
```

## compareStrings (first, second)

You can use this function to sort two strings alphabetically. The function comes with the following parameters:

- **first**: Determines the first string to compare.
- **second**: Determines the second string to compare.

### Example

Here is an example from the [ResourceList widget](./50-list-and-details-widgets.md#resourcelist):

```yaml
- widget: ResourceList
  source: '$myDeployments()'
  name: Example ResourceList Deployments
  sort:
    - source: '$item.spec.strategy.type'
      compareFunction: '$compareStrings($second, $first)'
      default: true
```

## matchByLabelSelector (item, selectorPath)

You can use this function to match Pods using a resource selector. The function comes with the following parameters:

- **item**: Describes a Pod to be used.
- **selectorPath**: Defines a path to selector labels from `$root`.

### Example

Example from [dataSources](90-datasources.md).

```yaml
- podSelector:
    resource:
      kind: Pod
      version: v1
    filter: '$matchByLabelSelector($item, $root.spec.selector)'
```

## matchEvents (item, kind, name)

You can use this function to match Events using a resource selector. The function comes with the following parameters:

- **item**: Describes an Event to be checked.
- **kind**: Describes the kind of the Event emitting resource.
- **name**: Describes the name of the Event emitting resource.

### Example

```yaml
- widget: EventList
  filter: '$matchEvents($item, $root.kind, $root.metadata.name)'
  name: events
  defaultType: NORMAL
  hideInvolvedObjects: true
```

## readableTimestamp (timestamp)

You can use this function to convert time to readable time. The function comes with the following parameters:

- **timestamp**: Defines a timestamp to convert.

### Example

```yaml
- source: '$readableTimestamp($item.lastTransitionTime)'
  name: status.conditions.lastTransitionTime
```
