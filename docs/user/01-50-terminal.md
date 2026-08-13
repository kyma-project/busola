# Kyma Dashboard Terminal

The Kyma dashboard terminal gives you an interactive shell directly in your browser, without installing any local tools. When you open the terminal, Kyma dashboard creates a lightweight container Pod in your cluster and connects your browser to its shell through a WebSocket proxy.

## Prerequisites

The terminal feature is disabled by default. To enable it, set the `TERMINAL` feature flag to `isEnabled: true` in the Busola configuration. For details, see [Feature Flags](technical-reference/feature-flags.md).

## Open the Terminal

1. Make sure you have a cluster selected in Kyma dashboard. The terminal icon isn't available on the **Clusters** page.
2. In the top navigation bar, choose the **Terminal** icon.
3. The terminal panel opens at the bottom of the screen.

You can resize the panel by dragging the separator between the terminal and the page content. To switch to full-screen mode, choose the **Full Screen** icon in the terminal header. To close the terminal, choose **X**.

## What Happens When You Open the Terminal

Opening the terminal triggers the following sequence:

1. Kyma dashboard creates the `busola-terminal` namespace in your cluster (if it does not exist yet).
2. A terminal Pod is created in that namespace, using the `busola-dev-toolbox` container image.
3. Your browser connects to the Pod's shell through a WebSocket proxy running in the Busola backend.

> [!IMPORTANT]
> When you close the terminal, the Pod is deleted. Any tools, files, or configurations you installed or created during the session are lost. The next time you open the terminal, the Pod starts fresh.

## Available Commands

The terminal provides a full interactive Bash shell (`/bin/bash`) inside the `busola-dev-toolbox` container. The following are available by default:

- Standard Linux commands (`ls`, `cat`, `grep`, `curl`, `wget`, and more)
- Additional tools bundled in the `busola-dev-toolbox` image

> [!NOTE]
> `kubectl` is not available in the terminal. The terminal Pod runs without a Kubernetes ServiceAccount, which means it has no access to the Kubernetes API. For cluster operations, use the Kyma dashboard UI or a local `kubectl` installation.

## Limitations

| Limitation                 | Details                                                                                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No `kubectl` access**    | The terminal Pod has no Kubernetes ServiceAccount. `kubectl` commands are not available.                                                                                |
| **Ephemeral session**      | Closing the terminal deletes the Pod. Everything installed or created in the session is lost. If you installed a tool in a previous session, you must install it again. |
| **Single Pod per cluster** | Each user has one terminal Pod per cluster connection.                                                                                                                  |
| **No persistence**         | Files and settings are not preserved between terminal sessions.                                                                                                         |

## Related Information

- [Tutorial: Check Services with curl in the Kyma Dashboard Terminal](tutorials/01-51-terminal-tutorial-curl.md)
- [Feature Flags](technical-reference/feature-flags.md)
