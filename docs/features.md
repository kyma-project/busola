# Feature Flags

The document explains the usage of feature flags in Busola, lists and describes all the available feature flags, and provides their configuration examples.

## Features priority

Initialisation of the Busola features is based on the `stage` property, which can take one of the following values:

- `PRIMARY` - the feature is resolved while the application bootstraps. Features that should be immediately visible must be set as `PRIMARY` (for example, main navigation structure).
- `SECONDARY` - the feature is resolved after the application is ready, it must be used for non-critical features (for example, additional navigation nodes).

If the stage is not set, the feature is loaded only on demand, most often by the iframe. Use the `useFeature` hook to request usage of such a feature.

> [!NOTE]
> Some features must be run before the application starts the bootstrap process, so they are out of the normal feature flow.

## Features List for Frontend

> **TIP:** The list is ordered alphabetically.

- **EXTENSIBILITY** - is used to indicate whether the Busola [extensibility](extensibility/README.md) feature is enabled.

Default settings:

```yaml
EXTENSIBILITY:
  isEnabled: true
```

- **EXTENSIBILITY_CUSTOM_COMPONENTS** - is used to indicate whether entire custom extensions can be added to Busola. See [this example](../examples/custom-extension/README.md).

Default settings:

```yaml
EXTENSIBILITY_CUSTOM_COMPONENTS:
  isEnabled: false
```

- **EXTENSIBILITY_INJECTIONS** - is used to indicate whether extensibility injections can be added to Busola. For more information, see [Widget Injection](https://github.com/kyma-project/busola/blob/main/docs/extensibility/70-widget-injection.md).

Default settings:

```yaml
EXTENSIBILITY_INJECTIONS:
  isEnabled: true
```

- **EXTERNAL_NODES** - a list of links to external websites. `category`: a category name, `icon`: an optional icon, `scope`: either `namespace` or `cluster` (defaults to `cluster`), `children`: a list of pairs (label and link).

  Default settings:

  ```yaml
  EXTERNAL_NODES:
    isEnabled: true
    stage: SECONDARY
    nodes:
      - category: My Category
        icon: course-book
        scope: cluster
        children:
          - label: Example Node Label
            link: https://github.com/kyma-project/busola
  ```

- **FEEDBACK** - determines if the feedback icon with the link redirecting the user to the survey should be rendered at the top bar.

  Default settings:

  ```yaml
  FEEDBACK:
    isEnabled: true
    link: https://www.youtube.com/watch?v=dQw4w9WgXcQ
  ```

- **GET_HELP_LINKS** – is used to show or hide helper links. You can find all the available links in the following example.
  In **config**, you can find the unchangeable keys (for example, you cannot use **helpSapCom** instead of **help-sap-com**). The keys include the default link, which takes you to the default address.

  Example:

  ```yaml
  GET_HELP_LINKS:
    config:
      kyma-project-io:
        default: https://kyma-project.io
      help-sap-com:
        default: https://help.sap.com
  ```

- **HIDDEN_NAMESPACES** – is used to define a list of Namespaces that are considered system, and are hidden by default.

Default settings:

```yaml
HIDDEN_NAMESPACES:
  isEnabled: true
  config:
    namespaces:
      - kube-system
```

- **ISTIO** - is used to show or hide the Istio-related views and to define which APIs are required for the views to be shown properly.
  For the view to be shown, you must enable the feature. Moreover, all the APIs listed in the selectors array must be available in a cluster.

  Default settings:

  ```yaml
  ISTIO:
    isEnabled: true
    selectors:
      - type: apiGroup
        apiGroup: networking.istio.io
  ```

- **KYMA_COMPANION** - determines if the Kyma Companion chat window is available in Busola.

Default settings:

```yaml
KYMA_COMPANION:
  isEnabled: false
```

- **KUBECONFIG_ID** – is used to configure the URL to which Busola sends a request to download a kubeconfig file. If you add `?kubeconfigID={your ID}` to the Busola URL, Busola tries to download the kubeconfig from `{kubeconfigUrl}/{yourID}`. If the operation succeeds, Busola adds the kubeconfing file to the cluster.
  If you use a full address in the **kubeconfigUrl** field, Busola also reads it.

  - **showClustersOverview** - optional configuration to instruct Busola to show **Clusters Overview** rather than the current context cluster, after the clusters are loaded.

  - **defaultKubeconfig** - define the optional default **KUBECONFIG_ID** to load this kubeconfig when you visit Busola homepage `/` and there are no memorized clusters in the application.

  Default settings:

  ```yaml
  KUBECONFIG_ID:
    isEnabled: true
    config:
      kubeconfigUrl: https://kyma-env-broker.cp.dev.kyma.cloud.sap/kubeconfig
      showClustersOverview: false
      defaultKubeconfig: AAAAA-BBBBB
  ```

- **LEGAL_LINKS** – is used to show or hide legal links. You can find all the available links in the following example.
  In **config** you can find the unchangeable keys (you cannot use **legalDisclosure** instead of **legal-disclosure**). The keys include both the default link, which takes you to the default address, and a link that depends on your chosen language.

  Example:

  ```yaml
  LEGAL_LINKS:
    config:
      legal-disclosure:
        default: https://www.sap.com/corporate/en/legal/impressum.html
        de: https://www.sap.com/corporate/de/legal/impressum.html
      privacy:
        default: https://help.sap.com/viewer/82bdf2271c6041f79387c122147cf774/Cloud/en-US
      copyright:
        default: https://www.sap.com/corporate/en/legal/copyright.html
        de: https://www.sap.com/corporate/de/legal/copyright.html
      trademark:
        default: https://www.sap.com/corporate/en/legal/trademark.html
        de: https://www.sap.com/corporate/de/legal/trademark.html
  ```

  The link under the given key is selected based on your language code (de, en, pl, etc.). If the code is not available, the default link is used.

* **PROTECTED_RESOURCES** – is used to block the edit and delete functions based on the determined rules. If the resource meets the rule requirements, the resource becomes protected and cannot be edited/deleted.

  Each resource requires the **match** field, which includes a list of key-value pairs. The proper rule description is when the definition given in the key matches the value.

  To switch comparison mode from **standard** to **regex**, set the **regex** parameter to `true`.

  Optionally, you can provide the **message** parameter, which displays a simple message, or **messageSrc**, which is a YAML path where the message to be displayed is included. If neither **message** nor **messageSrc** is provided, a generic message is used.

  Example:

  ```yaml
  PROTECTED_RESOURCES:
    isEnabled: true
    config:
      resources:
        # matches a resource with label "foo" equal to "bar"
        - match:
            $.metadata.labels.foo: bar
          # message to display in the tooltip
          message: This resource is protected
        # matches a resource with both label "foo" equal to "bar" and label "baz" equal to "qux"
        - match:
            $.metadata.labels.foo: bar
            $.metadata.labels.baz: qux
          # source of the message to display in the tooltip
          messageSrc: $.metadata.annotations.protected-message
        # matches a resource with label "foo" equal to alphanumeric value
        - match:
            $.metadata.labels.foo: ^[a-zA-Z0-9]$
          # allows comparison by regex
          regex: true
          # if neither "message" or "messageSrc" is given, a generic message is used (from i18n files - key: common.protected-resource)
  ```

The **match** keys and **messageSrc** must use the format described in the [`jsonpath` repository](https://github.com/dchester/jsonpath).

- **RESOURCE_VALIDATION** - determines the selected policies for [resource validation](resource-validation/README.md). They can be overwritten in the user preferences.

  Default settings:

  ```yaml
  RESOURCE_VALIDATION:
    isEnabled: true
    config:
      policies:
        - Default
  ```

- **SENTRY** – is used to enable monitoring of uncaught exceptions, which then are analyzed and repaired. The address to which you send the information is located under the **dsn** key.

  Default settings:

  ```yaml
  SENTRY:
    isEnabled: false
    config:
      dsn: ''
  ```

- **SHOW_GARDENER_METADATA** - determines if the metadata taken from Gardener should be displayed. The displayed information is the value from the `shoot-info` ConfigMap based on the `kube-system` Namespace. If the ConfigMap doesn't exist, the information is not displayed.

  ```yaml
  SHOW_GARDENER_METADATA:
    isEnabled: true
  ```

- **SHOW_KYMA_VERSION** – determines if the Kyma version should be visible on the **Cluster Details** page. The displayed version is the value of the `reconciler.kyma-project.io/origin-version` label in the `kyma-system` Namespace. If the value of the label is missing or there is no `kyma-system` Namespace, the information is not displayed.

  ```yaml
  SHOW_KYMA_VERSION:
    isEnabled: true
  ```

- **SNOW** - determines if the snow animation is enabled in Busola.

Default settings:

```yaml
SNOW:
  isEnabled: false
```

- **TRACKING** - determines if simple application usage tracking is enabled.

  ```yaml
  TRACKING:
    isEnabled: false
  ```

  > [!NOTE]
  > This feature is enabled on the frontend and backend.

## Features List for Backend

> [!NOTE]
> Backend features cannot be modified at the cluster's ConfigMap level.

- **GZIP** – is used to indicate whether a response from the backend server should be compressed or not.

Default settings:

```yaml
GZIP:
  isEnabled: true
```

- **KYMA_COMPANION** - is used to configure the location of the Kyma companion API.

  Default settings:

  ```yaml
  KYMA_COMPANION:
    link: ''
  ```

  - **TRACKING** - determines if simple application usage tracking is enabled.

  ```yaml
  TRACKING:
    isEnabled: false
  ```

  > [!NOTE]
  > This feature is enabled on the frontend and backend.
