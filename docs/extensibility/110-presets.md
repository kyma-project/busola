# Configure the presets Section

The **presets** section contains a list of objects that define which preset and template are used in the form view. If you specify a preset, it is displayed in the dropdown list along with the **Clear** option. When you select a preset, the form is filled with the values defined in the **value** property.

## Available Parameters

| Parameter     | Required | Type   | Description                                                                                                |
| ------------- | -------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| **name**      | **Yes**  | string | A name to display on the preset's dropdown.                                                                |
| **value**     | **Yes**  |        | It contains the fields that are set when you choose the given preset from the list.                        |
| **variables** | No       |        | It contains the names of the variables (`var`) that are overwritten and the values ​​that are assigned. |
| **default**   | No       |        | If set to `true`, it prefills the form with values defined in **value**. It defaults to `false`.           |

## Example

```yaml
- name: Cash Delivery
  default: true
  variables:
    - name: AdditionalBag
      value: no
  value:
    metadata:
      name: delivery-cash
    spec:
      description: Delivery with cash payment
- name: Card Pickup
  variables:
    - name: AdditionalBag
      value: yes
  value:
    metadata:
      name: card-pickup
    spec:
      data: regex
      description: Self-pickup and card payment
      orderDetails:
        paymentMethod: CARD
        realization: SELF-PICKUP
```

<img src="./assets/Presets.png" alt="Example of a preset" width="50%">
