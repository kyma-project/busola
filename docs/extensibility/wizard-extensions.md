# Configure a Config Map for Wizard Extensions

You can set up your ConfigMap to handle a custom wizard by adding objects to the **general** section. This section contains basic information about the created resources and additional options.
You can provide all the ConfigMap data sections as either JSON or YAML.

## Extension Version

The version is a string value that defines in which version the extension is configured. It is stored as a value of the `busola.io/extension-version` label. If the configuration is created with the **Create Extension** button, this value is provided automatically. When created manually, use the latest version number, for example, `'0.5'`.

> [!NOTE] 
> Busola supports only the two latest versions of the configuration. Whenever a new version of the configuration is proposed, go to your Extension and migrate your configuration to the latest version.

## Available Parameters

| Parameter                        | Required | Type                                         | Description                                                                                                                                          |
|----------------------------------|----------|----------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| **externalNodes**                | No       | string                                       | It is used to define optional links to external websites that appear in the navigation menu.                                                         |
| **externalNodes.catagory**       | No       | string                                       | A name of the category.                                                                                                                              |
| **externalNodes.scope**          | No       | string                                       | It can be `namespace` or `cluster`. It defaults to `cluster`.                                                                                        |
| **externalNodes.icon**           | No       | string                                       | An icon that you can choose from the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview). |
| **externalNodes.children**       | No       | string                                       | a list of child Nodes containing details about the links.                                                                                            |
| **externalNodes.children.label** | No       | string                                       | a displayed label.                                                                                                                                   |
| **externalNodes.children.link**  | No       | string, [JSONata](100-jsonata.md) expression | a link to an external website.                                                                                                                       |


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
See [Additional Sections for Wizard Extensions](170-additional-sections.md) for more information on the available sections.
