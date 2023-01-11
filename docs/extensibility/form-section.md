# Create forms with extensibility

- [_Form_ overview](#form-overview)
- [Variable fields](#variable-fields)
- [Alert](#alert)
- [Simple widgets](#simple-widgets)
  - [Text](#text)
  - [Name](#name)
  - [CodeEditor](#codeeditor)
  - [Resource](#resource)
- [Complex widgets](#complex-widgets)
  - [KeyValuePair](#keyvaluepair)
  - [ResourceRef](#resourceref)
- [Presentation widgets](#presentation-widgets)
  - [FormGroup](#formgroup)
  - [GenericList](#genericlist)
  - [SimpleList](#simplelist)

# Form overview

The **form** section contains a list of objects that define which fields are included in the final form. All given fields are placed in the advanced form by default. It's possible to add a field to the simple form by providing the `simple: true` flag. You can also remove it from the advanced form by providing the `advanced: false` flag.

Any parameters that are not handled by the widget are added to the schema directly, so it's possible to add or override existing values. For example, add an **enum** parameter to provide selectable values in a field or specify additional parameters to improve the schema validation, for example, `min` and `max` attributes for numeric inputs to enable HTML validation.

If you target elements of an array rather than the array itself, you can use the `items[]` notation.

### Item parameters

- **path** - _[required]_ path to the property that you want to display in the form.
- **name** - an optional name for the field instead of the default capitalized last part of the path. This can be a key from the **translation** section.
- **widget** - optional widget used to render the field referred to by the **path** property. If you don't provide the widget, a default handler is used depending on the data type provided in the schema. For more information about the available widgets, see [Form section](form-section.md).
- **children** - child widgets used for grouping. Child paths are relative to its parent.
- **simple** - parameter used to display the simple form. It is `false` by default.
- **advanced** - parameter used to display the advanced form. It is `true` by default.
- **visibility** - a [JSONata](jsonata.md) expression controlling the visibility of the element.
- **overwrite** - parameter used to disable the overwriting (clearing) of hidden fields. Used together with **visibility**, defaults to `true`.
  **NOTE:** it is recommended to set **overwrite** to `false` when defining fields with the same `path` and different **visibility** conditions.
- **trigger** - List of events to trigger, see [Dynamic fields section](#dynamic-field-values).
- **subscribe** - A map of events to subscribe to, to their respective values, see [Dynamic fields section](#dynamic-field-values).

### Example

```yaml
- path: spec.priority
  simple: true
- path: spec.items[]
  children:
    - path: name
      name: Item name
    - path: service.url
    - path: service.port
    - path: service.number
      visibility: "$item.port.protocol = 'HTTP'"
      overwrite: false
      enum:
        - 80
        - 81
    - path: service.number
      visibility: "$item.port.protocol = 'HTTPS'"
      overwrite: false
      enum:
        - 443
        - 444
```

## Variable fields

Additionally, it's possible to define variable fields. In this case, **path** is omitted, and a **var** argument is used to specify the variable name to assign. Variable names have to be unique across the extension. Such a value is not added to the resultant YAML but instead stored in memory and provided to any [JSONata](jsonata.md) handlers as variables, for example, `$foo`. Variables are provided for the current context. If a variable is defined inside an array, the value is specified for that specific item. To access raw values, the predefined `$vars` variable has to be used.

When using a variable inside an array it has to be wrapped inside a `[]` element (see [example](#example)).

### Item parameters

- **var** - _[required]_ variable name.
- **type** - _[required]_ type of field, as defined by JSON Schema.
- **defaultValue** - default value used for the variable when opening the form.
- **dynamicValue** - a [JSONata](jsonata.md) expression used to calculate the value of the variable. This happens when opening the form or after editing the raw YAML of the resource.

All other fields can be used analogously to regular form items (except for the **path** and **children** parameters).

### Example

In the example, the visibility for item price and color are analogous - the former uses scoped variables for the current item, and the latter extracts the value from an array variable using provided index - this is mostly useful for complex scenarios only.

```yaml
- var: useDescription
  type: boolean
  dynamicValue: '$boolean(spec.description)'
- path: spec.description
  visibility: '$useDescription'
- path: spec.items
  widget: GenericList
  children:
    - path: '[]'
      children:
        - path: name
        - var: itemMode
          type: string
          enum:
            - simple
            - verbose
        - path: price
          visibility: "$itemMode = 'verbose'"
        - path: color
          visibility: "$vars.itemMode[$index] = 'verbose'"
        - path: description
          visibility: '$useDescription'
```

## Dynamic field values

It's possible to modify field values automatically when another value changes. This works on a subscriber system. Any field (including variable fields) can send a trigger. When that happens a field that subscribes to it will have its value changed accordingly.

Triggers are listed as a **trigger** field that contains a list of string labels.

Subscriptions are a key-value object where in the most generic case the key is the name of the trigger, while the value is a [JSONata](jsonata.md) expression used to generate the new value.

### Example

```yaml
- path: spec.url
  trigger: [server]
- path: spec.port
  trigger: [server]
- path: spec.server
  subscribe:
    server: "'http://' & spec.url & ':' & spec.port"
```

or with variables:

```yaml
- var: url
  type: string
  trigger: [server]
- var: port
  type: string
  trigger: [server]
- path: spec.server
  subscribe:
    server: "'http://' & $url & ':' & $port"
```

### Scoping

When a trigger is invoked in an array, by default it matches only fields in the same array item. And it bubbles all the way up to root. To subscribe to a trigger on a different level a jsonata-like notation can be used. To match triggers globally, that is, match triggers happening in root, a `$root.foo` notation can be used. To just access a higher level, `$parent.foo` can be used instead. It's possible to repeat `$parent` multiple times to access even higher levels (e.g. `$parent.$parent.foo`).

## Default fields

Each form is created with the following fields:

- `metadata.name` - on simple and advanced form, as a [Name](#name) widget.
- `metadata.labels` - on advanced form, as a [KeyValuePair](#keyvaluepair) widget.
- `metadata.annotations` - on advanced form, as a [KeyValuePair](#keyvaluepair) widget.

You can change them by specyfing overrides in schema, for example:

```yaml
- path: metadata.name
  inputInfo: 'This is an important field.' # overrides the default information
- path: metadata.annotations
  visibility: false # hides annotations
```

# Form widgets

Form widgets are used in the resource forms.

### Alert

Alert widgets display values using predefined types.

#### Widget-specific parameters

- **alert** - information that you want to display.
- **disableMargin** - an optional boolean which disables the margin outside the alert body.
- **severity** - specifies one of the alert severities: **information**, **warning**, **error**, or **success**. By default, it's set to **information**.

#### Example

```yaml
- simple: true
  widget: Alert
  severity: warning
  alert: "'alert.tls.https'"
  visibility: "$value.port.protocol = 'HTTPS'"

- widget: Alert
  alert: "$item = 80  ? 'Using Default 80' : 'Using Different Port then 80'"
```

<img src="./assets/form-widgets/Alert.png" alt="Example of a text widget" style="border: 1px solid #D2D5D9">

## Simple widgets

Simple widgets represent a single scalar value.

### Text

Text widgets render a field as a text field. They are used by default for all string values.

#### Widget-specific parameters

- **enum[]** - an array of options to generate an input field with a dropdown. Optionally can be a string containing a [JSONata](jsonata.md) expression returning an array of options.
- **placeholder** - specifies a short hint about the input field value.
- **required** - a boolean which specifies if a field is required. The default value is taken from CustomResourceDefintion (CRD); if it doesn't exist in the CRD, then it defaults to `false`.
- **inputInfo** - a string below the input field that shows how to fill in the input.
- **description** - a string displayed in a tooltip when you hover over a question mark icon, next to the input's label. The default value is taken from the CustomResourceDefintion (CRD).
- **readOnly** - a boolean which specifies if a field is read-only. Defaults to `false`.

#### Example

```yaml
- path: spec.my-data
  widget: Text
```

<img src="./assets/form-widgets/Text.png" alt="Example of a text widget" style="border: 1px solid #D2D5D9">

#### Example

```yaml
- path: protocol
  simple: true
  enum:
    - HTTP
    - HTTPS
    - HTTP2
    - GRPC
    - GRPC-WEB
    - MONGO
    - REDIS
    - MYSQL
    - TCP
  description: Choose a protocol type from the dropdown.
  tooltip: Specifies which protocol to use for tunneling the downstream connection.
```

<img src="./assets/form-widgets/Dropdown.png" alt="Example of a dropdown text widget with a tooltip" style="border: 1px solid #D2D5D9">
<img src="./assets/form-widgets/Dropdown2.png" alt="Example of a dropdown text widget" style="border: 1px solid #D2D5D9">

### Name

Name widgets render a name input field. They contain an automatic name generator, and additionally set the label field when changed. They are added automatically to all forms, and set to the `metadata.name` value.

#### Widget-specific parameters

- **extraPaths** - an array of extra paths to fill in with the contents of the field. Each path can either be a period-separated string or an array of strings.
- **placeholder** - specifies a short hint about the input field value.
- **inputInfo** - a string below the input field that shows how to fill in the input. It defaults to `Name must consist of lowercase alphanumeric characters or '-', and must start and end with an alphanumeric character (e.g. 'my-name', or '123-abc').`. To disable any suggestion, set this value to `null`.
- **description** - a string displayed in a tooltip when you hover over a question mark icon, next to the input's label. The default value is taken from the CustomResourceDefintion (CRD).
- **disableOnEdit** - parameter used to disable field in edit mode, defaults to `false`.
- **required** - a boolean which specifies if a field is required. The default value is taken from CRD; if it doesn't exist in CRD, then it defaults to `false`.

#### Example

```yaml
- path: spec.my-data
  widget: Name
```

<img src="./assets/form-widgets/Name.png" alt="Example of a name widget" style="border: 1px solid #D2D5D9">

#### Example

```yaml
- path: spec.my-data
  widget: Name
  disableOnEdit: true
```

<img src="./assets/form-widgets/Name2.png" alt="Example of a name widget with disabled option to edit" style="border: 1px solid #D2D5D9">

### CodeEditor

CodeEditor widgets render a versatile code editor that can be used to edit any variable. The editor's default language is JSON.

#### Widget-specific parameters

- **language** - a [JSONata](jsonata.md) expression resolving the desired language. It has access to the `$root` variable, containing the entire resource.
- **inputInfo** - a string below the input field that shows how to fill in the input.
- **description** - a string displayed in a tooltip when you hover over a question mark icon, next to the input's label. The default value is taken from the CustomResourceDefintion (CRD).
- **defaultExpanded** - a boolean that specifies if the widget should be expanded by default. Defaults to `false`.

#### Example

```yaml
- path: spec.data
  widget: CodeEditor
  inputInfo: Data needs to be a valid JSON object.
  description: Data is passed on to the application.
  language: "'JSON'"
```

<img src="./assets/form-widgets/CodeEditor.png" alt="Example of a code editor widget" style="border: 1px solid #D2D5D9">

> NOTE: Remember to put both single and double quotes if you want to use plain language (for example, "'YAML'"). Specifying just double quotes ("YAML") makes Busola try to access a nonexistent `YAML` variable, resulting in the language being `undefined`.

### Resource

Resource widgets render a dropdown list of specified resources and store the selected one as a string containing its name.

#### Widget-specific parameters

- **resource**:
  - **kind** - _[required]_ Kubernetes kind of the resource.
  - **group** - API group used for all requests. Not provided for Kubernetes resources in the core (also called legacy) group.
  - **version** - _[required]_ API version used for all requests.
  - **scope** - either `namespace` or `cluster`. When set to `cluster`, namespaced resources are fetched from all Namespaces. Defaults to `cluster`.
  - **namespace** - Namespace to fetch resources from. Used only when scope is `namespace` and resources need to be fetched from a specific Namespace. Defaults to the active Namespace when omitted.
- **required** - a boolean which specifies if a field is required. The default value is taken from CRD; if it doesn't exist in CRD, then it defaults to `false`.
- **inputInfo** - a string below the input field that shows how to fill in the input.
- **description** - a string displayed in a tooltip when you hover over a question mark icon, next to the input's label. The default value is taken from the CustomResourceDefintion (CRD).

#### Example

```yaml
- path: spec.namespace
  widget: Resource
  resource:
    scope: cluster
    kind: Namespace
    version: v1
- path: spec.gateway
  widget: Resource
  resource:
    kind: Gateway
    scope: namespace
    namespace: kyma-system
    group: networking.istio.io
    version: v1alpha3
```

<img src="./assets/form-widgets/Resource.png" alt="Example of a Resource widget" style="border: 1px solid #D2D5D9">

## Complex widgets

Complex widgets handle more advanced data structures such as arrays or objects.

### KeyValuePair

KeyValuePair widgets render an `object` value as a list of fields. One is used for a key and the other for a value, allowing for adding and removing entries.

#### Widget-specific parameters

- **required** - a boolean which specifies if a field is required. The default value is taken from CRD; if it doesn't exist in the CRD, then it defaults to `false`.
- **keyEnum[]** - an array of options to generate a key input field with a dropdown.
- **value**:
  - **type** - a string that specifies the type of the value input. The options are `object`, `number`, `text`. Defaults to `text`.
  - **keyEnum[]** - an array of options to generate a key input field with a dropdown only if the `type` is set to `object`.
  - **valueEnum[]** - an array of options to generate a value input field with a dropdown.
- **inputInfo** - a string below the input field that shows how to fill in the input.
- **description** - a string displayed in a tooltip when you hover over a question mark icon, next to the input's label. The default value is taken from the CustomResourceDefintion (CRD).
- **defaultExpanded** - a boolean that specifies if the widget should be expanded by default. Defaults to `false`.

#### Example

```yaml
- path: spec.my-data
  widget: KeyValuePair
  description: Key and value must start and end with an alphanumeric character.
  tooltip: >
    Labels are intended to be used to specify identifying attributes of objects
    that are meaningful and relevant to users, but do not directly imply semantics
    to the core system.
  keyEnum:
    - prefix
    - regex
    - exact
```

<img src="./assets/form-widgets/KeyValue.png" alt="Example of a KeyValuePair widget" style=" border: 1px solid #D2D5D9">

### ResourceRef

ResourceRef widgets render two dropdowns to select the associated resources' names and Namespaces. The corresponding specification object is of the form `{name: 'foo', namespace: 'bar'}`. If this widget is provided with children, they are rendered as usual.

#### Widget-specific parameters

- **resource**:
  - **kind** - _[required]_ Kubernetes kind of the resource.
  - **group** - API group used for all requests. Not provided for Kubernetes resources in the core (also called legacy) group.
  - **version** - _[required]_ API version used for all requests.
- **provideVar** - when this field is defined, the chosen resource will be provided as a variable of this name.
- **toInternal** - a [JSONata](jsonata.md) function to convert from the stored value to the `{name, namespace}` format. Useful, for example, when the data is stored as a string.
- **toExternal** - a corresponding function to convert back to store.
- **defaultExpanded** - a boolean that specifies if the widget should be expanded by default. Defaults to `false`.

#### Example

```yaml
- path: spec.my-data
  widget: ResourceRef
  resource:
    kind: Secret
    version: v1
  provideVar: secret
  children:
    - path: key
      enum: '$keys($secret.data)'
- path: spec.my-gateways
  widget: ResourceRef
  resource:
    kind: Gateway
    group: networking.istio.io
    version: v1alpha3
  toInternal: |
    (
      $values := $split($, '/');
      { 'namespace': $values[0], 'name': $values[1] }
    )
  toExternal: namespace & '/' & name
```

<img src="./assets/form-widgets/ResourceRef.png" alt="Example of a ResourceRef widget" style="border: 1px solid #D2D5D9">

## Presentation widgets

Presentation widgets do not handle data directly and only serve to group contents into a more readable form.

### FormGroup

FormGroup widgets render an `object` as a collapsible section.

#### Widget-specific parameters

- **columns** - number of columns the content is rendered in. Defaults to 1.
- **defaultExpanded** - a boolean that specifies if the widget should be expanded by default. Defaults to `false`.

#### Example

```yaml
- path: spec.service
  widget: FormGroup
  children:
    - path: host
    - path: port
```

<img src="./assets/form-widgets/FormGroup.png" alt="Example of a FormGroup widget" style="border: 1px solid #D2D5D9">

### GenericList

GenericList widgets render an array as a list of collapsible sections with their own sub-forms. An **Add** button is present to add new entries.

#### Widget-specific parameters

- **placeholder** - specifies a short hint about the input field value.
- **template** - specifies default structure for a list item.
- **defaultExpanded** - a boolean that specifies if the widget should be expanded by default. Defaults to `false`.

#### Example

```yaml
- path: spec.services
  widget: GenericList
  children:
    - path: '[].host'
    - path: '[].port'

 - widget: GenericList
   path: spec.filter.filters
   children:
     - path: '[].eventType.value'
       placeholder: placeholder.eventType
     - path: '[].eventSource.value'
   template:
     eventSource:
       property: source
       type: exact
       value: ''
     eventType:
       property: type
       type: exact
```

<img src="./assets/form-widgets/GenericList.png" alt="Example of a GenericList widget" style="border: 1px solid #D2D5D9">

### SimpleList

SimpleList widgets render an array as a table with rows representing data items and columns representing different fields. New items are added automatically when new entries are typed in.

> **NOTE:** This type of field is only suitable for simple data types and can't contain more complex structures in its items.

#### Widget-specific parameters

- **placeholder** - specifies a short hint about the input field value.
- **required** - a boolean which specifies if a field is required. The default value is taken from CRD; if it doesn't exist in the CRD, then it defaults to `false`.
- **inputInfo** - a string below the input field that shows how to fill in the input.
- **description** - a string displayed in a tooltip when you hover over a question mark icon, next to the input's label. The default value is taken from the CustomResourceDefintion (CRD).
- **defaultExpanded** - a boolean that specifies if the widget should be expanded by default. Defaults to `false`.

#### Example

```yaml
- path: spec.services
  widget: SimpleList
  children:
    - path: '[].host'
      placeholder: Enter the required host
    - path: '[].port'
      placeholder: Enter the required port
```

<img src="./assets/form-widgets/SimpleList.png" alt="Example of a SimpleList widget" style="border: 1px solid #D2D5D9">

#### Scalar values

When array items are scalars instead of objects, a child still has to be provided with the path `[]`; no header with the field title is then rendered in the resulting table.

```yaml
- path: spec.services
  widget: SimpleList
  children:
    - path: '[]'
```
