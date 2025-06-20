# Configuration

Learn about the [default configuration](#default-configuration) in Busola and [how to change it](#change-the-configuration).

## Default Configuration

Busola is delivered with the following default settings:

| Parameter  | Comment                                                                                                                                          | Default Value           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| `features` | Switches a set of Busola features on and off. Use selectors to configure conditions for the features. To switch them off, set `isEnabled=false`. | `isEnabled=true`        |
| `version`  | Configuration version. Don’t edit this. Can be empty.                                                                                            | the most recent release |

## Configuration Sources

Busola configuration is the product of gathering and merging the configurations from several individual sources. The following list presents the sources in the order of precedence:

**Backend:**

- Busola backend default cluster configuration, acquired from the [defaultConfig.yaml](../../backend/settings/defaultConfig.yaml) file.
- Busola cluster configuration, available on the Busola cluster in the ConfigMap "busola/busola-config" under the key "config".
  This data is mounted to the Busola `web` and `backend` Pods, and during the local development,
  the [defaultConfig.yaml](../../backend/settings/defaultConfig.yaml) file is used.

**Frontend:**

- Built-in, hardcoded defaults.
- Busola frontend default cluster configuration, acquired from the [defaultConfig.yaml](../../public/defaultConfig.yaml) file.
- Busola cluster configuration, available on the Busola cluster in the ConfigMap "busola/busola-config" under the key "config".
  This data is mounted to the Busola `web` and `backend` Pods, and during the local development,
  the [defaultConfig.yaml](../../public/defaultConfig.yaml) file is used.
- Target cluster configuration, available on the target cluster in ConfigMap "kube-public/busola-config" under the key "config". Busola performs a request for that resource during the bootstrap process.
- Custom configuration with `extensibility` and `config` located in **public/environments**, [read more](#environment-specific-settings).

## Changing the Configuration

If you have the required authorizations and access to the kubeconfig, you can change the settings for the Busola cluster configuration and the target cluster configuration.

With the `feature` toggles, you can switch each Busola feature on or off and configure them to fit your needs.
Features comprise the following elements:

- `FEATURE_ID`: Unique identifier, as defined in the Busola source code
- `selector`: The k8s resources that can activate the feature
- `isEnabled`: Activates or deactivates the feature, overwriting the status set by `selector`
- `config`: Provides additional configuration options as needed for each feature. For details, see the README in the specific component or feature.

See the available Busola [feature flags](../features.md) for more information.

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

> [!WARNING]
> The `extensions.yaml`, `statics.yaml`, `wizards.yaml`, and `config.yaml` files are necessary for Busola to work properly.

To activate your environment configuration, create or edit the `active.env` file in the [public directory](../../public).
Follow this example of the `active.env` file:

```dotenv
ENVIRONMENT=your-environment-name
```

When **ENVIRONMENT** is set to `my-env`, Busola looks for your custom configuration in `public/environemnt/my-env`.
If **ENVIRONMENT** is not set, Busola fetches the default configuration with the same structure as the custom configuration located in the [public directory](../../public).

In the case of the Docker image, the `active.env` file is created at the startup of the image from the environment specified in the **ENVIRONMENT** variable.
