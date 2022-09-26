# Jsonata preset functions for resource-based extensions

**Table of Contents**

- [Overview](#overview)
- [Preset functions](#preset-functions)
  - [_matchByLabelSelector_](#matchbylabelselectoritem-selectorpath)
  - [_compareStrings_](#comparestringsfirst-second)

## Overview

This document describes how to use the preset JSONata functions.

## Preset functions

## matchByLabelSelector(item, selectorPath)

You can use this function to match Pods using a resource selector.

### Function parameters

- **item** - Pod to be used.
- **selectorPath** - path to selector labels from `$root`.

### Example

Example from [dataSources](datasources-section.md).

```yaml
podSelector:
  resource:
    kind: Pod
    version: v1
  filter: '$matchByLabelSelector($item, $root.spec.selector)'
```

## compareStrings(first, second)

You can use this function to sort two strings alphabetically.

### Function parameters

- **first** - first string to compare.
- **second** - second string to compare.

### Example

Example from the [ResourceList widget](display-section.md#resourcelist).

#### Examples

```yaml
widget: ResourceList
source: '$myDeployments()'
name: Example ResourceList Deployments
sort:
  - source: '$item.spec.strategy.type'
    compareFunction: '$compareStrings($second, $first)'
    default: true
```
