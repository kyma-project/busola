# Kyma Dashboard Terminal

The Kyma dashboard terminal gives you an interactive shell directly in your browser, without installing any local tools. When you open the terminal, Kyma dashboard creates a lightweight container Pod in your cluster and connects your browser to its shell through a WebSocket proxy.

## Prerequisites

The terminal feature is disabled by default. To enable it, set the `TERMINAL` feature flag to `isEnabled: true` in the Busola configuration. For details, see [Feature Flags](technical-reference/feature-flags.md).

## Open the Terminal

1. Make sure you have a cluster selected in Kyma dashboard. The terminal icon isn't available on the **Clusters** page.
2. In the top navigation bar, choose the **Terminal** icon.
3. The terminal panel opens at the bottom of the screen.

Kyma dashboard creates the `busola-terminal` namespace in your cluster (if it does not exist yet) and starts a Pod using the `busola-dev-toolbox` container image.

> [!WARNING]
> When you close the terminal, the Pod is deleted. Any tools, files, or configurations you installed or created during the session are lost. The next time you open the terminal, the Pod starts fresh.

## Available Commands

The terminal provides a full interactive Bash shell (`/bin/bash`) inside the `busola-dev-toolbox` container. The following are available by default:

- Standard Linux commands (`ls`, `cat`, `grep`, `curl`, `wget`, and more)
- Additional tools bundled in the [`busola-dev-toolbox` image](https://github.com/kyma-project/busola/blob/main/Dockerfile.dev-toolbox)

> [!NOTE]
> `kubectl` is not available in the terminal. The terminal Pod runs without a Kubernetes ServiceAccount, which means it has no access to the Kubernetes API. For cluster operations, use the Kyma dashboard UI or a local `kubectl` installation.

## Limitations

The following table summarizes the key limitations of the terminal feature:

| Limitation                 | Details                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| **No `kubectl` access**    | The terminal Pod has no Kubernetes ServiceAccount. `kubectl` commands are not available.             |
| **Ephemeral session**      | Closing the terminal deletes the Pod. Files, tools, and settings are not preserved between sessions. |
| **Single Pod per cluster** | Each user has one terminal Pod per cluster connection.                                               |     |

## Related Information

- [Tutorial: Check Services with curl in the Kyma Dashboard Terminal](tutorials/01-51-terminal-tutorial-curl.md)
- [Feature Flags](technical-reference/feature-flags.md)
