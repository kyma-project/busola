# Jsonata preset functions for resource-based extensions

**Table of Contents**

- [Overview](#overview)
- [Preset functions](#preset-functions)
  - [_matchByLabelSelector_](#matchbylabelselector)

## Overview

This document describes how to use the preset JSONata functions.

## Preset functions

## matchByLabelSelector

This function can be used to match Pods using a resource selector.

### Item parameters

- **item** - Pod to be used.
- **label** - path to selector labels from `$root`.

### Example

Example from dataSources

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
