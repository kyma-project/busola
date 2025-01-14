# Configure the presets Section

The **presets** section contains a list of objects that define which preset and template are used in the form view. If you specify a preset, it is displayed in the dropdown list along with the **Clear** option. When you select a preset, the form is filled with the values defined in the **value** property.

## Available Parameters

| Parameter   | Required | Type    | Description                                                                                      |
|-------------|----------|---------|--------------------------------------------------------------------------------------------------|
| **name**    | **Yes**  | string  | A name to display on the preset's dropdown.                                                      |
| **value**   | **Yes**  |         | It contains the fields that are set when you choose the given preset from the list.              |
| **default** | No       | boolean | If set to `true`, it prefills the form with values defined in **value**. It defaults to `false`. |

## Example

```yaml
- name: template
  default: true
  value:
    metadata:
      name: my-name
    spec:
      description: A set description
- name: preset
  value:
    metadata:
      name: second-one
    spec:
      data: regex
      description: A different description
      items:
        - name: item-1
          value: 10
        - name: item-2
          value: 11
        - name: item-3
          value: 5
```
