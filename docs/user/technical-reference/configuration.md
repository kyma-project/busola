# Busola Configuration

Learn about the default configuration in Busola and how to change it.

## Configuration Sources

Busola configuration is the product of gathering and merging the configurations from several individual sources. The following list presents the sources in the order of precedence.

### Backend

- Busola backend default cluster configuration, acquired from the [defaultConfig.yaml](https://github.com/kyma-project/busola/blob/main/backend/settings/defaultConfig.yaml) file.
- Busola cluster configuration, available in the Busola cluster in the ConfigMap `busola/busola-config` under the key **config**.
  This data is mounted to the `busola` Pods, and during the local development,
  the [defaultConfig.yaml](https://github.com/kyma-project/busola/blob/main/backend/settings/defaultConfig.yaml) file is used.

### Frontend

- Built-in, hardcoded defaults.
- Busola frontend default cluster configuration, acquired from the [defaultConfig.yaml](https://github.com/kyma-project/busola/blob/main/public/defaultConfig.yaml) file.
- Busola cluster configuration, available in the Busola cluster in the ConfigMap `busola/busola-config` under the key **config**.
  This data is mounted to the `busola` Pods, and during the local development,
  the [defaultConfig.yaml](https://github.com/kyma-project/busola/blob/main/public/defaultConfig.yaml) file is used.
- Target cluster configuration, available in the target cluster in ConfigMap `kube-public/busola-config` under the key **config**. Busola performs a request for that resource during the bootstrap process.
- Busola active environment, `active.env` file is used.
- Custom configuration with `extensibility` and `config` located in `public/environments`. See [Environment-Specific Settings](#environment-specific-settings).

## Changing the Configuration

If you have the required authorizations and access to the kubeconfig, you can change the settings for the Busola cluster configuration and the target cluster configuration.

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
custom-env/
├── config
│   └── config.yaml
└── extensions
    ├── extensions.yaml
    └── wizards.yaml
```

> ### Warning
>
> The `extensions.yaml`, `statics.yaml`, `wizards.yaml`, and `config.yaml` files are necessary for Busola to work properly.

To activate your environment configuration, create or edit the `active.env` file in the [public directory](https://github.com/kyma-project/busola/tree/main/public).
Follow this example of the `active.env` file:

```dotenv
ENVIRONMENT=your-environment-name
```

When **ENVIRONMENT** is set to `my-env`, Busola looks for your custom configuration in `public/environments/my-env`.
If **ENVIRONMENT** is not set, Busola fetches the default configuration with the same structure as the custom configuration located in the [public directory](https://github.com/kyma-project/busola/tree/main/public).

In the case of the Docker image, the `active.env` file is created at the startup of the image from the environment specified in the **ENVIRONMENT** variable.
