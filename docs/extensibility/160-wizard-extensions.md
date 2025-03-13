# Configure a Config Map for Wizard Extensions

You can set up your ConfigMap to handle a custom wizard by adding objects to the **general** section. This section contains basic information about the created resources and additional options.
You can provide all the ConfigMap data sections as either JSON or YAML.

## Extension Version

The version is a string value that defines in which version the extension is configured. It is stored as a value of the `busola.io/extension-version` label. If the configuration is created with the **Create Extension** button, this value is provided automatically. When created manually, use the latest version number, for example, `'0.5'`.

> [!NOTE]
> Busola supports only the two latest versions of the configuration. Whenever a new version of the configuration is proposed, go to your Extension and migrate your configuration to the latest version.

## Available Parameters

| Parameter             | Required | Type   | Description                                                                                                        |
| --------------------- | -------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| **id**                | Yes      | string | An identifier used to reference the wizard to trigger its opening.                                                 |
| **resources**         | Yes      | string | Provides information about the resources created by the wizard. This is a key value map with values consisting of: |
| **resources.kind**    | Yes      | string | A Kubernetes resource kind.                                                                                        |
| **resources.version** | No       | string | A Kubernetes resource version.                                                                                     |
| **resources.group**   | No       | string | An API group used for all the requests. It's not provided for the Kubernetes resources in the core (legacy) group. |

### Example

```yaml
id: mywizard
name: Create a MyResource
resources:
  myresource:
    kind: MyResource
    group: busola.example.com
    version: v1
  myservice:
    kind: MyService
    group: busola.example.com
    version: v1
```

See [Additional Sections for Wizard Extensions](170-additional-sections-wizard.md) for more information on the available sections.
