# _presets_ section

The **presets** section contains a list of objects that define which preset and template will be used in the form view. If any preset has been defined, it will be displayed in the drop-down list along with a second "Clear" setting. If the user selects a preset, the form will be filled with the property defined in the values.

## preset configuration object fields

- **name** - _[required]_ a name to display on presets dropdown,
- **value** - _[required]_ contains fields that will be set when this preset is chosen from the list.
- **default** - For `default` equal to `true`, it prefills form with values defined in value. Defaults to `false`.

## Example

```json
[
  {
    "name": "template",
    "default": true,
    "value": {
      "metadata": {
        "name": "my-name"
      },
      "spec": {
        "description": "The description that will be set"
      }
    }
  },
  {
    "name": "preset",
    "value": {
      "metadata": {
        "name": "second-one"
      },
      "spec": {
        "data": "regex",
        "description": "A different description",
        "items": [
          {
            "name": "item-1",
            "value": 10
          },
          {
            "name": "item-2",
            "value": 11
          },
          {
            "name": "item-3",
            "value": 5
          }
        ]
      }
    }
  }
]
```

<img src="./assets/Presets.png" alt="Preset list with one entry defined as default" style="border: 1px solid #D2D5D9">
