# Local Kubeconfig Files for Development

This directory is used to store kubeconfig files for local development with the `kubeconfigID` permalink feature.

## Usage

1. Place your kubeconfig file in this directory **without a file extension**
2. The filename becomes the `kubeconfigID` parameter value

### Example

1. Copy your kubeconfig:
   ```bash
   cp ~/.kube/config public/kubeconfig/myconfig
   ```

2. Access Busola with the permalink:
   ```
   http://localhost:8080/?kubeconfigID=myconfig&path=/namespaces/default/pods
   ```

## URL Format

```
/?kubeconfigID=<filename>&path=<path>
```

### Parameters

| Parameter | Description |
|-----------|-------------|
| `kubeconfigID` | The filename (without extension) of the kubeconfig file in this directory |
| `path` | (Optional) The path to navigate to after loading the kubeconfig |

### Path Examples

| Path | Description |
|------|-------------|
| `/namespaces/default/pods` | Pods in default namespace |
| `/namespaces/kube-system/deployments` | Deployments in kube-system |
| `/nodes` | Cluster nodes |
| `/overview` | Cluster overview |

## Security Note

⚠️ **Do not commit kubeconfig files to the repository!**

The `.gitignore` in this directory is configured to ignore all files except documentation.
Kubeconfig files may contain sensitive credentials like tokens or certificates.

## Production Configuration

In production, the `kubeconfigUrl` is configured via the `KUBECONFIG_ID` feature flag in `defaultConfig.yaml`:

```yaml
KUBECONFIG_ID:
  isEnabled: true
  config:
    kubeconfigUrl: https://your-kubeconfig-service.example.com/kubeconfig
```

See [Feature Flags Documentation](../../docs/user/technical-reference/feature-flags.md) for more details.