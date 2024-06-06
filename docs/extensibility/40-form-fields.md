# Configure Create and Edit Pages

You can customize the create and/or edit pages of the user interface component of your resource by adding objects to the **data.form** section in your resource ConfigMap.

## Default **form.metadata** Fields

Each form is created with the following default fields, also known as Form Fields.

* **metadata.name**
* **metadata.labels**
* **metadata.annotations**

Values for those fields are added to the form by default. You can change the default fields by specyfing overrides in the schema. For example:

```yaml
form:
  - path: metadata.name
    inputInfo: 'This is an important field with an example link {{[SAP](https://www.sap.com)}}' # overrides the default information
  - path: metadata.annotations
    visibility: false # hides annotations
```

## Available Parameters

Any parameters that are not handled by a widget are added to the schema directly, so it's possible to add or override existing values. For example, add an **enum** parameter to provide selectable values in a field or specify additional parameters to improve the schema validation, for example, `min` and `max` attributes for numeric inputs to enable HTML validation.

If you target elements of an array rather than the array itself, you can use the `items[]` notation.

This table lists the available parameters of the **data.form** section in your resource ConfigMap. You can learn whether each of the parameters is required and what purpose it serves.

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| **path** | **Yes** | string or [JSONata](jsonata.md) | A path to the property that you want to display in the form. |
| **name** | No | string | The name for the field instead of the default capitalized last part of the path. This can be a key from the **translation** section. |
| **widget** | No | string | A widget used to render the field referred to by the **path** property. If you don't provide the **widget**, a default handler is used depending on the data type provided in the schema. For more information about the available widgets, see [Form Widgets](./60-form-widgets.md). |
| **children** | No | | Child widgets used for grouping. Child paths are relative to its parent. |
| **visibility** | No | boolean or [JSONata](jsonata.md) expression | Controls the visibility of the element. |
| **overwrite** | No | boolean | Used to disable the overwriting (clearing) of hidden fields. Used together with **visibility**, defaults to `true`. <br><br> **NOTE:** It is recommended to set **overwrite** to `false` when defining fields with the same `path` and different **visibility** conditions. |
| **trigger** | No | []string | A list of events to trigger, see [Dynamic fields section](#dynamic-field-values). |
| **subscribe** | No | object | A map of events to subscribe to, to their respective values, see [Dynamic fields section](#dynamic-field-values). |

See the following example:

```yaml
- path: spec.priority
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

### Use Variables in **data.form**

Additionally, it's possible to define variable fields. In this case, **path** is omitted, and a **var** argument is used to specify the variable name to assign. Variable names have to be unique across the extension. Such a value is not added to the resultant YAML but instead stored in memory and provided to any [JSONata](jsonata.md) handlers as variables, for example, `$foo`. Variables are provided for the current context. If a variable is defined inside an array, the value is specified for that specific item. To access raw values, you must use the predefined `$vars` variable.

When using a variable inside an array it has to be wrapped inside a `[]` element. See the following example.

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| **var** | **Yes** | string | The variable name. |
| **type** | **Yes** | string | A type of the field, as defined by JSON Schema. |
| **defaultValue** | No | string | The default value used for the variable when opening the form. |
| **dynamicValue** | No | [JSONata](jsonata.md) expression | Used to calculate the default value of the variable. This happens when opening the form or after editing the raw YAML of the resource. This does not change on user input - for that see the [Dynamic fields section](#dynamic-field-values). |

All other fields can be used analogously to regular form items (except for the **path** and **children** parameters).

In the example, the visibility for item price and color are analogous - the former uses scoped variables for the current item, and the latter extracts the value from an array variable using the provided index - this is useful for complex scenarios only.

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

### Dynamic Field Values

It's possible to modify field values automatically when another value changes. This works on a subscriber system. Any field (including variable fields) can send a trigger. When that happens a field that subscribes to it will have its value changed accordingly.

Triggers are listed as a **trigger** field that contains a list of string labels.

Subscriptions are a key-value object. In the most generic case, the key is the name of the trigger, while the value is a [JSONata](jsonata.md) expression used to generate the new value.

See the following example:

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

#### Scoping

When a trigger is invoked in an array, by default it matches only fields in the same array item. And it bubbles all the way up to root. To subscribe to a trigger on a different level, you can use a jsonata-like notation. To match triggers globally, that is, match triggers happening in root, you can use a `$root.foo` notation. To just access a higher level, use `$parent.foo` instead. It's possible to repeat `$parent` multiple times to access even higher levels (for example, `$parent.$parent.foo`).

## Related Links

* [Widgets available for the create and edit pages](./60-form-widgets.md)
