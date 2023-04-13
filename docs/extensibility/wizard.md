# Config Map for wizard extensions

**Table of Contents**

- [Overview](#overview)
- [Extension version](#extension-version)
- [_general_ section](#general-section)
- [_steps_ section](#steps-section)
- [_defaults_ section](#defaults-section)

## Overview

This document describes the required ConfigMap setup that you need to configure in order to handle a custom wizard.
You can provide all the ConfigMap data sections as either JSON or YAML.

## Extension version

The version is a string value that defines in which version the extension is configured. It is stored as a value of the `busola.io/extension-version` label. If the configuration is created with the **Create Extension** button, this value is provided automatically. When created manually, use the latest version number, for example, `'0.5'`.

> **NOTE:**: Busola supports only the two latest versions of the configuration. Whenever a new version of the configuration is proposed, go to your Extension and migrate your configuration to the latest version.

## _general_ section

The **general** section is required and contains basic information about the created resources and additional options.

### Item parameters

- **id** - _[required]_ - an identifier used to reference the wizard to trigger its opening.
- **resources** - _[required]_ - information about the resources created by the wizard. This is a key value map with values consisting of:
  - **kind** - _[required]_ Kubernetes kind of the resource.
  - **version** - _[required]_ API version used for all requests.
  - **group** - API group used for all requests. Not provided for Kubernetes resources in the core (also called legacy) group.
- **name** - wizard window title.

### Example

```yaml
id: mywizard
name: Create a MyResource
resources:
  myresource:
    kind: MyResource
    group: busola.example.com
    version: v1
  myservice:
    kind: MyService
    group: busola.example.com
    version: v1
```

## _steps_ section

Each wizard consists of steps. This section contains their definitions.

### Item parameters

Each step contains the following parameters:

- **name** - _[required]_ - the name of the step displayed on the step navigation and in the step header
- **description** - extra details about the step, shown only when the step is active
- **resource** - _[required]_ - the identifier of the default resource for this step
- **form** - _[required]_ - the definition of the form - this is analogous to the contents of the [_form_ section](form-section.md) of the resource extension

## _defaults_ section

Contains a map of default values for specific resources. This is appended to the basic skeleton resources created based on the data provided in the [_general_ section](#general-section). This section is optional and if present, not all resources have to be covered.

### Example

```yaml
myresource:
  spec:
    enabled: true
```

For example of usage please check [Get started with functions](../../examples/wizard/README.md) wizard.
