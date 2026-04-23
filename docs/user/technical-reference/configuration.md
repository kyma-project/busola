# Busola Configuration

Learn about the configuration works in Busola and how to change it.

## Configuration Sources

Busola configuration is the product of gathering and merging the configurations from several individual sources.
The order of configuration is important.
The order is from least to the most important as given in ####Backend and ####Frotnend section.

## Configuration can be configured at two levels:

- Installation-Level Configuration which can adjust backend and frontend for all clusters.
- Per-Cluster Configuration which can only configure busola frotnend for specific cluster.

[//]: # 'Prawdopodobnie do wywalenia, jedynie EXTERNAL_NODES tego niby izywa, ale nie znalazłem w kodzie zeby to bylo brane pod uwage'

## Features Priority

Initialization of the Busola features is based on the **stage** property, which can take one of the following values:

- `PRIMARY` - the feature is resolved while the application bootstraps. Features that must be immediately visible must be set as `PRIMARY`, for example, the main navigation structure.
- `SECONDARY` - the feature is resolved after the application is ready, it must be used for non-critical features, for example, additional navigation nodes.

> [!NOTE]
> Some features must be run before the application starts the bootstrap process, so they are out of the ordinary feature flow.
> [//]: # ()

#### Backend

- Busola backend default cluster configuration, acquired from the [defaultConfig.yaml](https://github.com/kyma-project/busola/blob/main/backend/settings/defaultConfig.yaml) file.
- Busola cluster configuration available at `public/config/config.yaml` for local development or `/core-ui/config/config.yaml` in the container.
  The configuration can be mounted in deployed busola on k8s cluster by creating the ConfigMap `busola/busola-config` under the key **config**.

#### Frontend

- Busola frontend default cluster configuration, acquired from the [defaultConfig.yaml](https://github.com/kyma-project/busola/blob/main/public/defaultConfig.yaml) file.
- Busola cluster configuration available at `public/config/config.yaml` for local development or `/core-ui/config/config.yaml` in the container.
  The configuration can be mounted in deployed busola on k8s cluster by creating the ConfigMap `busola/busola-config` under the key **config**.
- Environment specific configuration with `extensibility` and `config` located in `public/environments`. Activated by `active.env` file. See [Environment-Specific Settings](#environment-specific-settings).
- **Per cluster configuration**, available in the target cluster in ConfigMap `kube-public/busola-config` under the key **config**. Busola performs a request for that resource during the bootstrap process.

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
