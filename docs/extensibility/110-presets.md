# Configure the presets Section

The **presets** section contains a list of objects that define which preset and template are used in the form view. If you specify a preset, it is displayed in the dropdown list along with the **Clear** option. When you select a preset, the form is filled with the values defined in the **value** property.

## Available Parameters

| Parameter   | Required | Type    | Description                                                                                      |
| ----------- | -------- | ------- | ------------------------------------------------------------------------------------------------ |
| **name**    | **Yes**  | string  | A name to display on the preset's dropdown.                                                      |
| **value**   | **Yes**  |         | It contains the fields that are set when you choose the given preset from the list.              |
| **default** | No       | boolean | If set to `true`, it prefills the form with values defined in **value**. It defaults to `false`. |

## Example

```yaml
- name: Cash Delivery
  default: true
  value:
    metadata:
      name: Delivery&Cash
    spec:
      description: Delivery with cash payment
- name: Card Pickup
  value:
    metadata:
      name: Card&Pickup
    spec:
      data: regex
      description: Self-pickup and card payment
      orderDetails:
        paymentMethod: CARD
        realization: SELF-PICKUP
```

<img src="./assets/Presets.png" alt="Example of a preset" style="width: 50%; border: 15px solid #D2D5D9;">
