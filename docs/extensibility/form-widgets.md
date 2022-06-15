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

<p>
<img src="./assets/form-widgets/Text.png" style="max-width:100%;">
</p>

### Name

Name widgets render a name input field. They contain an automatic name generator, and additionally set the label field when changed. They are added automatically to all forms, and set to the `metadata.name` value.

#### Example

```json
{
  "path": "spec.my-data",
  "widget": "Name"
}
```

<p>
<img src="./assets/form-widgets/Name.png" style="max-width:100%;">
</p>

## Complex widgets

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

<p>
<img src="./assets/form-widgets/KeyValue.png" style="max-width:100%;">
</p>

## Presentation widgets

Presentation widgets do not handle data directly and only serve to group contents into a more readable form.

### FormGroup

FormGroup renders an `object` as a collapsible section. Requires the children property to render the content of the section.

#### Example

```json
({
  "name": "spec.service",
  "widget": "FormGroup"
},
{
  "path": "spec.service.host"
},
{
  "path": "spec.service.port"
})
```

<p>
<img src="./assets/form-widgets/FormGroup.png" style="max-width:100%;">
</p>
