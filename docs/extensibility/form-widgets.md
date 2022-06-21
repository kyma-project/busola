# Form widgets

Form widgets are used in the resource forms.

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

Name widgets render a name input field. They contain an automatic name generator, and additionally set the label field when changed. They are added automatically to all forms, and set to the `metadata.name` value.

#### Widget-specific parameters

- **extraPaths** - an array of extra paths to fill in with the contents of the field. Each path can either be a period-separated string or an array of strings.

#### Example

```json
{
  "path": "spec.my-data",
  "widget": "Name"
}
```

### CodeEditor

CodeEditor widgets render a versatile code editor that can be used to edit any variable. The editor's default language is JSON.

#### Example

```json
{
  "path": "spec.my-data",
  "widget": "CodeEditor"
}
```

## Complex widgets

Complex widgets handle more advanced data structures such as arrays or objects.

### KeyValuePair

KeyValuePair widgets render an `object` value as a list of dual text fields. One is used for a key and the other for a value, allowing for adding and removing entries.

#### Example

```json
{
  "path": "spec.my-data[]",
  "widget": "KeyValuePair"
}
```

### ResourceRefs

ResourceRefs widgets render the lists of dropdowns to select the associated resources' names and Namespaces. The corresponding specification object must be an array of objects `{name: 'foo', namespace: 'bar'}`.

#### Example

```json
{
  "path": "spec.my-data[]",
  "widget": "ResourceRefs"
}
```

## Presentation widgets

Presentation widgets do not handle data directly and only serve to group contents into a more readable form.

### FormGroup

FormGroup widgets render an `object` as a collapsible section.

#### Example

```json
{
  "path": "spec.service",
  "widget": "FormGroup"
}
```
