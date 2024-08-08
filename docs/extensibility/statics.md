# Config Map for static extensions

**Table of Contents**

- [Overview](#overview)
- [Static extension label](#static-extension-label)
- [Extension version](#extension-version)
- [_general_ section](#general-section)
- [_injections_ section](#injections-section)

## Overview

This document describes the required ConfigMap setup that you need to configure to handle a static extension.
You can provide all the ConfigMap data sections as either JSON or YAML.

## Static extension label

To define a static extension, add the `busola.io/extension:statics` label to the ConfigMap.

## Extension version

The version is a string value that defines in which version the extension is configured. It is stored as a value of the `busola.io/extension-version` label. When created manually, use the latest version number, for example, `'0.5'`.

> **NOTE:** Busola supports only the two latest versions of the configuration. Whenever a new version of the configuration is proposed, go to your Extension and migrate your configuration to the latest version.

## _general_ section

The **general** section is not required as static extensions present data that are not connected to any resource. Instead, they may use information from the page they are displayed on via variable `$embedResource`.

### _externalNodes_

The **externalNodes** parameter allows you to define optional links to external websites that appear in the navigation menu.

- **externalNodes** - an optional list of links to external websites.
  - **category** - a category name.
  - **scope** - either `namespace` or `cluster`. Defaults to `cluster`.
  - **icon** - an optional icon. Go to [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview) to find the list of the available icons.
  - **children** - a list of child Nodes containing details about the links.
    - **label** - a displayed label
    - **link** - a link to an external website. You can provide a [JSONata](jsonata.md) function.

### Example

```yaml
general:
  externalNodes:
    - category: My Category
      icon: course-book
      children:
        - label: Example Node Label
          link: 'https://github.com/kyma-project/busola'
```

## _injections_ section

For more information, read the [widget injections overview](./70-widget-injection.md).
