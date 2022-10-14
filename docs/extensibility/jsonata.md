# Jsonata preset functions for resource-based extensions

**Table of Contents**

- [Overview](#overview)
- [Scoping](#scoping)
- [Preset functions](#preset-functions)
  - [_matchByLabelSelector_](#matchbylabelselectoritem-selectorpath)
  - [_matchEvents_](#matcheventsitem-kind-name)
  - [_compareStrings_](#comparestringsfirst-second)

## Overview

This document describes how to use JSONata expressions [JSONata](https://docs.jsonata.org/overview.html) throughout the extensions.

## Scoping

The primary data source of JSONata expressions changes depending on where it's used. Starting with the root, it contains the whole resource, but whenever it's in a child whose parent has a **source** (in lists and details) or **path** (in forms) parameter, the scope changes to data from that source or path.

Additionally, scope in arrays changes to the array item.

For example, for this resource:

```yaml
spec:
  name: foo
  description: bar
  items:
    - name: item-name
      details:
        status: ok
```

The following definition has their scope changed as follows:

```yaml
- source: spec.name # top level, scope is the same as resource

- source: spec # top level, scope is the same as resource
  children:
    - source: name # parent has source=spec, therefore this refers to spec.name

- children:
    - source: spec.name # however there's no parent source here, therefore scope is still the resource

- source: spec.items
  children:
    - source: name # parent data is an array, therefore scope changes to it's item - this refers to spec.items[0].name
    - source: details.status # refers to spec.items[0].details.status (same as above)
    - source: details # this changes scope for it's children again
      children:
        source: status # so this refers to spec.items[0].details.status
```

## Common variables

Common variables are the primary means to bypass the default scoping.

- **\$root** - always contains the reference to the resource, so any JSONata can always be `$root.spec.name`.
- **\$item** - refers to the most recent array item. When not in an array, it's equal to **\$root**.
- **\$items** - contains an array of references to all parent array items (with the last item being equal to **\$item**).
- **\$value** - when used in a jsonata other than **source** (for example **visibility**, but also other widget-specific formulas) contains the value returned by the source
- **\$index** - exists in array components, refers to the index of the current item of an array.

#### Example

```yaml
- widget: Table
  source: spec.rules
  visibility: $exists($value)
  collapsibleTitle: "'Rule #' & $string($index + 1)"
```

## Data sources

Whenever data sources are provided, they are available as corresponding variable names. See [data sources](datasources-section.md) section for more details.

## Preset functions

### matchByLabelSelector(item, selectorPath)

You can use this function to match Pods using a resource selector.

#### Function parameters

- **item** - Pod to be used.
- **selectorPath** - path to selector labels from `$root`.

#### Example

Example from [dataSources](datasources-section.md).

```yaml
- podSelector:
    resource:
      kind: Pod
      version: v1
    filter: '$matchByLabelSelector($item, $root.spec.selector)'
```

### matchEvents(item, kind, name)

You can use this function to match Events using a resource selector.

#### Function parameters

- **item** - Event to be checked.
- **kind** - kind of the Event emitting resource.
- **name** - name of the Event emitting resource.

#### Example

```yaml
- widget: EventList
  filter: '$matchEvents($item, $root.kind, $root.metadata.name)'
  name: events
  defaultType: NORMAL
  hideInvolvedObjects: true
```

### compareStrings(first, second)

You can use this function to sort two strings alphabetically.

#### Function parameters

- **first** - first string to compare.
- **second** - second string to compare.

#### Example

Example from the [ResourceList widget](display-section.md#resourcelist).

```yaml
- widget: ResourceList
  source: '$myDeployments()'
  name: Example ResourceList Deployments
  sort:
    - source: '$item.spec.strategy.type'
      compareFunction: '$compareStrings($second, $first)'
      default: true
```

## readableTimestamp(timestamp)

You can use this function to convert time to readable time.

### Function parameters

- **timestamp** - timestamp to convert.

### Example

```yaml
- source: '$readableTimestamp($item.lastTransitionTime)'
  name: status.conditions.lastTransitionTime
```
