# Form widgets

Widgets available for resource forms.

### Text

Text widget renders the field as a text field. Used by default for all string values.

```json
{
  "path": "spec.my-data",
  "widget": "Text"
}
```

**Name**

Name widgets renders a name input field. Contains an automatic name generator and additionally sets the label field when changed. Added automatically to all forms and set to the `metadata.name` value.

```json
{
  "path": "spec.my-data",
  "widget": "Name"
}
```

**KeyValuePair**

Renders an `object` value as list of dual text fields one used for key the other for value, allowing for adding and removing entries.

```json
{
  "path": "spec.my-data",
  "widget": "KeyValuePair"
}
```

**FormGroup**

Renders an `object` as a collapsible section. Requires the children property to render the content of the section.

```json
{
  "name": "spec.service",
  "widget": "FormGroup",
  "children": [{ "path": "spec.service.host" }, { "path": "spec.service.port" }]
}
```
