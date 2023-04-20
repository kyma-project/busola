# Config Map for static extensions

**Table of Contents**

- [Overview](#overview)
- [Static extension label](#static-extension-label)
- [Extension version](#extension-version)
- [_general_ section](#general-section)
- [_injections_ section](#injections-section)

## Overview

This document describes the required ConfigMap setup that you need to configure in order to handle a static extension.
You can provide all the ConfigMap data sections as either JSON or YAML.

## Static extension label

To define static extension add label `busola.io/extension:statics` to ConfigMap.

## Extension version

The version is a string value that defines in which version the extension is configured. It is stored as a value of the `busola.io/extension-version` label. When created manually, use the latest version number, for example, `'0.5'`.

> **NOTE:**: Busola supports only the two latest versions of the configuration. Whenever a new version of the configuration is proposed, go to your Extension and migrate your configuration to the latest version.

## _general_ section

The **general** section is not required as static extensions present data that are not conected to any resource. Instead they may use information from page they are displayed on via variable `$embedResource`.

## _injections_ section

For more information read [widget _injections_ overview](display-section.md#widget-injections-overview).
