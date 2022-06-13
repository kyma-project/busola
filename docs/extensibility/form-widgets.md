# Form widgets

Widgets available for resource forms.

## Simple widgets

Simple widgets represent a single scalar value.

### Text

Text widgets render a field as a text field. They are used by default for all string values.

#### Example

```json
{
  "path": "spec.my-data",
  "widget": "Text"
}
```

### Name

Name widgets renders a name input field. Contains an automatic name generator and additionally sets the label field when changed. Added automatically to all forms and set to the `metadata.name` value.

#### Example

```json
{
  "path": "spec.my-data",
  "widget": "Name"
}
```

## Complex Widgets

Complex widgets handle more complex values than a simple scalar. Either arrays or objects.

### KeyValuePair

Renders an `object` value as list of dual text fields one used for key the other for value, allowing for adding and removing entries.

#### Example

```json
{
  "path": "spec.my-data",
  "widget": "KeyValuePair"
}
```

## Presentation Widgets

Presentation widgets do not handle data directly and only serve to group contents into a more readable form.

### FormGroup

Renders an `object` as a collapsible section. Requires the children property to render the content of the section.

#### Example

```json
{
  "name": "spec.service",
  "widget": "FormGroup",
  "children": [{ "path": "spec.service.host" }, { "path": "spec.service.port" }]
}
```
