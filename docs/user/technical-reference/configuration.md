# Busola Configuration

Learn how the configuration works in Busola and how to change it.

## Configuration Sources

Busola builds its configuration by gathering and merging settings from several individual sources.
The order matters — Busola applies sources from least to most important, as listed in the [Backend](#backend) and [Frontend](#frontend) sections below.

## Configuration Levels

You can configure Busola at two levels:

- Installation-Level Configuration — adjusts backend and frontend for all clusters. Configured using environment variables (ENVs).
- Per-Cluster Configuration — configures the Busola frontend for a specific cluster only. Configured using the `busola-config` ConfigMap.

### Backend

- Busola backend default cluster configuration, loaded from the [defaultConfig.yaml](https://github.com/kyma-project/busola/blob/main/backend/settings/defaultConfig.yaml) file.
- Busola cluster configuration available at `public/config/config.yaml` for local development or `/core-ui/config/config.yaml` in the container.
  To mount the configuration in a deployed Busola on a Kubernetes cluster, create the ConfigMap `busola/busola-config` under the key **config**.
- Environment-specific configuration with `config.yaml` located in `backend/environments`. Activate it with the `active.env` file. See [Environment-Specific Settings](#environment-specific-settings).

### Frontend

- Busola frontend default cluster configuration, loaded from the [defaultConfig.yaml](https://github.com/kyma-project/busola/blob/main/public/defaultConfig.yaml) file.
- Busola cluster configuration available at `public/config/config.yaml` for local development or `/core-ui/config/config.yaml` in the container.
  To mount the configuration in a deployed Busola on a Kubernetes cluster, create the ConfigMap `busola/busola-config` under the key **config**.
- Environment-specific configuration with `extensibility` and `config` located in `public/environments`. Activate it with the `active.env` file. See [Environment-Specific Settings](#environment-specific-settings).
- **Per-cluster configuration**, available in the target cluster in ConfigMap `kube-public/busola-config` under the key **config**. Busola requests that resource during the bootstrap process.

## Changing the Configuration

With the `feature` toggles, you can switch each Busola feature on or off and configure them to fit your needs.
Features comprise the following elements:

- `FEATURE_ID`: Unique identifier, as defined in the Busola source code
- `isEnabled`: Activates or deactivates the feature, overwriting the status set by `selector`
- `selector`: The Kubernetes resources that can activate the feature
- `config`: Provides additional configuration options as needed for each feature. For details, see the README in the specific component or feature.

For more information, see the available Busola [feature flags](feature-flags.md).

### Environment-Specific Settings

You can provide an override to the default configuration with your own environment-specific settings.
Follow this pattern to structure your custom environment directory and place it in `public/environments`.

```
my-env/
├── config
│   └── config.yaml
└── extensions
    ├── extensions.yaml
    └── wizards.yaml
```

> [!WARNING]
>
> The `extensions.yaml`, `statics.yaml`, `wizards.yaml`, and `config.yaml` files are necessary for Busola to work properly.

To activate your environment configuration, create or edit the `active.env` file in the [public directory](https://github.com/kyma-project/busola/tree/main/public).
Follow this example of the `active.env` file:

```dotenv
ENVIRONMENT=your-environment-name
```

When **ENVIRONMENT** is set to `my-env`, Busola looks for your custom configuration in `public/environments/my-env`.
If **ENVIRONMENT** is not set, Busola fetches the default configuration with the same structure as the custom configuration located in the [public directory](https://github.com/kyma-project/busola/tree/main/public).

In the Docker image, Busola creates the `active.env` file at startup from the **ENVIRONMENT** variable.
