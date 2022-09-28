# Jsonata preset functions for resource-based extensions

**Table of Contents**

- [Overview](#overview)
- [Preset functions](#preset-functions)
  - [_matchByLabelSelector_](#matchbylabelselectoritem-selectorpath)
  - [_matchByResource_](#matchbyresourceitem-kind-name)
  - [_compareStrings_](#comparestringsfirst-second)

## Overview

This document describes how to use the preset JSONata functions.

## Preset functions

## matchByLabelSelector(item, selectorPath)

This function can be used to match Pods using a resource selector.

### Function parameters

- **item** - Pod to be used.
- **selectorPath** - path to selector labels from `$root`.

### Example

Example from dataSources.

```json
{
  "podSelector": {
    "resource": {
      "kind": "Pod",
      "version": "v1"
    },
    "filter": "$matchByLabelSelector($item, $root.spec.selector)"
  }
}
```

## matchByResource(item, kind, name)

This function can be used to match Events using a resource selector.

### Function parameters

- **item** - Event to be used.
- **kind** - path to kind from `$root`.
- **name** - path to name from `$root`.

### Example

Example from dataSources.

```json
{
  "widget": "EventsList",
  "filterBy": "$matchByResource($item, $root.kind, $root.metadata.name)",
  "name": "events",
  "defaultType": "NORMAL",
  "hideInvolvedObjects": true
}
```

## compareStrings(first, second)

This function can be used to sort two strings alphabetically.

### Function parameters

- **first** - first string to compare.
- **second** - second string to compare.

### Example

Example from the ResourceList widget.

#### Examples

```json
{
  "widget": "ResourceList",
  "source": "$myDeployments()",
  "name": "Example ResourceList Deployments",
  "sort": [
    {
      "source": "$item.spec.strategy.type",
      "compareFunction": "$compareStrings($second, $first)",
      "default": true
    }
  ]
}
```
