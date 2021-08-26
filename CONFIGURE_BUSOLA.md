# Configure Busola

## Default Configuration

By default, Busola is delivered with the following default settings:

| Parameter                | Comment                                                                                                                                           | Default Value                                                                                                                                                                                                        |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `kubeconfig`               | The kubeconfig as JSON                                                                                                                            | `null`                                                                                                                                                                                                                 |
| `hiddenNamespaces`         | A list of namespace names that are considered system, and are hidden by default.                                                                  | default list: `istio-system`, `knative-eventing`, `knative-serving`, `kube-public`, `kube-system`, `kyma-backup`, `kyma-installer`, `kyma-integration`, `kyma-system`, `natss`, `kube-node-lease`, `kubernetes-dashboard`, `serverless-system` |
| `features`                 | Switches a set of Busola features on and off. Use selectors to configure conditions for the features. To switch them off, set `isEnabled=false`.    | isEnabled=true                                                                                                                                                                                                       |
| `navigation.disabledNodes` | Array of IDs of navigation nodes that are hidden from navigation. Format: `<category>.<nodeName>` or `<namespace>.<category>.<nodeName>`)             | empty                                                                                                                                                                                                                |
| `navigation.externalNodes` | A nested list of links to external websites. `category`, `icon`: a category name and optional icon / `children`: a list of pairs (label and link) | category: Learn more / children: Kyma Documentation, Our Slack, Github                                                                                                                                               |
| `version`                  | Configuration version. Don’t edit this. Can be empty.                                                                                             | the most recent release                                                                                                                                                                                              |

## Change the Configuration

If you have the required authorizations and access to the kubeconfig, you can change the settings for the Busola cluster configuration and the target cluster configuration.

With the `feature` toggles, you can switch each Busola feature on or off.
There are two kinds of features:

- KUBECONFIG_ID: If enabled, and if a kubeconfig ID is defined, it pulls the kubeconfig from the service specified at `config.kubeconfigUrl`.
- The remaining features, which contain the `apiGroup` selector. They enable and disable navigation nodes on the UI and some functionalities. For example, if `API_GATEWAY` is enabled, the `API Rules` node is displayed, and the Function details allow exposing a Function with API rules.
