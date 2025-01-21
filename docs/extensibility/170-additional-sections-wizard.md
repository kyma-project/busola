# Additional Sections for Wizard Extensions

## steps Section

Each wizard consists of steps. The steps section contains their definitions.

### Available Parameters

| Parameter       | Required | Type   | Description                                                                                                                  |     |
| --------------- | -------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- | --- |
| **name**        | **Yes**  | string | The step name displayed on the step navigation and in the step header.                                                       |     |
| **resource**    | **Yes**  | string | The default resource identifier for this step.                                                                               |     |
| **form**        | **Yes**  | string | the form definition. This is analogous to the contents of the [form section](./40-form-fields.md) of the resource extension. |     |
| **description** | No       | string | Additional details about the step, shown only when the step is active.                                                       |     |

## defaults Section

The defaults section is optional. If present, not all resources must be covered. This section contains a map of default values for specific resources. It is appended to the basic skeleton resources created based on the data provided in the [general section](160-wizard-extensions.md).

## Example

```yaml
data:
  defaults:
    qqq:
      spec:
        string-ref: foo
    subqqq:
      metadata:
        labels:
          example: example
  steps:
    - name: First step
      description: this is the first step
      resource: qqq
      form:
        - id: foo
          path: spec.string-ref
          name: string ref
          trigger: [sr]
        - path: spec.double-ref.name
          name: double ref name
          visibility: false
          overwrite: false
          subscribe:
            init: spec."string-ref"
            sr: spec."string-ref"
```

For the example of usage, check the [Get started with functions](../../examples/wizard/README.md) wizard.
