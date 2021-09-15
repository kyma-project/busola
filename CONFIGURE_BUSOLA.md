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

With the `feature` toggles, you can switch each Busola feature on or off and configure them to fit your needs.
Features comprise the following elements:

- `FEATURE_ID`: Unique identifier, as defined in the Busola source code
- `selector`: The k8s resources that can activate the feature
- `isActive`: Activates or deactivates the feature, overwriting the status set by `selector`
- `config`: Provides additional configuration options as needed for each feature. For details, see the README in the specific component or feature.
