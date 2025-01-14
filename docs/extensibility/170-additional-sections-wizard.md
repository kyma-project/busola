# Additional Sections for Wizard Extensions

## _steps_ section

Each wizard consists of steps. This section contains their definitions.

### Available Parameters

| Parameter       | Required | Type   | Description                                                                                                                    |  |
|-----------------|----------|--------|--------------------------------------------------------------------------------------------------------------------------------|--|
| **name**        | **Yes**  | string | The step name displayed on the step navigation and in the step header.                                                         |  |
| **resource**    | **Yes**  | string | The default resource identifier for this step.                                                                                 |  |
| **form**        | **Yes**  | string | the form definition. This is analogous to the contents of the [_form_ section](./40-form-fields.md) of the resource extension. |  |
| **description** | No       | string | Additional details about the step, shown only when the step is active.                                                         |  |


## _defaults_ section

This section is optional. If present, not all resources must be covered. This section contains a map of default values for specific resources. It is appended to the basic skeleton resources created based on the data provided in the [_general_ section](#general-section).

### Example

```yaml
myresource:
  spec:
    enabled: true
```

For the example of usage, check the [Get started with functions](../../examples/wizard/README.md) wizard.
