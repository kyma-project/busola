# Jsonata preset functions for resource-based extensions

**Table of Contents**

- [Overview](#overview)
- [Preset functions](#preset-function)
  - [_matchByLabelSelector_](#matchByLabelSelector)

## Overview

This document describes useg of preset jsonata functions.

## Preset functions

## matchByLabelSelector

This function can be used to match pods using selector from resource.

### Item parameters

- **item** - pod.
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
