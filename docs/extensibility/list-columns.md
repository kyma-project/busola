# Configure a List Page

You can customize the list page of the user interface component of your resource by adding objects to the **data.list** section in your resource ConfigMap.
Each object adds a new column to your table.

## Available Parameters

This table lists the available parameters of the **data.list** section in your resource ConfigMap. You can learn whether each of the paramaters is required and what purpose it serves.

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| **source** | Yes |[JSONata](jsonata.md) expression | It is used to fetch data for the column. In its simplest form, it's the path to the value. |
| **widget** | No|  | A widget used to render the field referred to by the **source** property. By default, the value is displayed verbatim.|
| **valuePreprocessor** | | | The name of [value preprocessor](resources.md#value-preprocessors). |
| **sort** | No | boolean | If set to `true`, it allows you to sort the resource list using this value. Defaults to `false`. It can also be set to an object with the following properties:
| **sort.default** | No | boolean | If the flag is set to `true`, the list view is sorted by this value by default. |
| **sort.compareFunction** | No | [JSONata](jsonata.md) compare function | It is required to use `$first` and `$second` variables when comparing two values. There is a special custom function [compareStrings](jsonata.md#comparestringsfirst-second) used to compare two strings, for example, `$compareStrings($first, $second)` |
| **search** | No | boolean | A serach option. If set to `true`, it allows you to search the resource list by this value. Defaults to false. It can also be set to an object with the following property: |
|**search.searchFunction** | No |[JSONata](jsonata.md) search function |  It allows you to use `$input` variable to get the search input's value that can be used to search for more complex data. |

## Example

```yaml
- source: spec.url
  search: true
  sort:
    default: true
    compareFunction: '$compareStrings($first, $second)'
- source: spec.priority
  widget: Badge
- source: "$join(spec.toppings.name, ', ')"
- name: quantityIsMore
  source:
    '$filter(spec.toppings, function ($v, $i, $a) { $v.quantity > $average($a.quantity)
    })'
- source: "$join(spec.volumes.name, ', ')"
- source: "$filter(spec.volumes, function ($v, $i, $a) {'configMap' in $keys($v)})" # List the array of volume objects that have a ConfigMap
- source: spec.volumes['configMap' in $keys($)] # This is the alternative way of listing the array of volume objects that have a ConfigMap
- source: "$join(spec.volumes['configMap' in $keys($)].name, ', ')" # List volume names of volumes that have a ConfigMap
```

## Related Links

- [Widgets available for the list and details pages](./list-and-details-widgets.md)
