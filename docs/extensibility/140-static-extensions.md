# Configure a Config Map for Static Extensions

You can define a static extension by adding the `busola.io/extension:statics` label to the ConfigMap. You don't need the **general** section as static extensions present data that are not connected to any resource. Instead, they may use information from the page they are displayed on using the `$embedResource` variable .You can provide all the ConfigMap data sections as either JSON or YAML.

## Extension Version

The version is a string value that defines in which version the extension is configured. It is stored as a value of the `busola.io/extension-version` label. When created manually, use the latest version number, for example, `'0.5'`.

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
general:
  externalNodes:
    - category: My Category
      icon: course-book
      children:
        - label: Example Node Label
          link: 'https://github.com/kyma-project/busola'
```

To see an exemplary configuration of the `External Nodes` feature in static extensions, check the [configuration example](examples/../../../examples/statics/statics-external-nodes.yaml).
