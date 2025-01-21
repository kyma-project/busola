# Use JSONata Expressions with Resource-Based Extensions

## Scoping

The primary data source of [JSONata](https://docs.jsonata.org/overview.html) expressions changes depending on where it's used. Starting with the root, it contains the whole resource, but whenever it's in a child whose parent has a **source** (in lists and details) or **path** (in forms) parameter, the scope changes to data from that source or path.

Additionally, the scope in arrays changes to the array item.

For example, for this resource:

```yaml
spec:
  name: foo
  description: bar
  items:
    - name: item-name
      details:
        status: ok
```

The following definition has their scope changed as follows:

```yaml
- source: spec.name # top level, scope is the same as a resource

- source: spec # top level, scope is the same as a resource
  children:
    - source: name # parent has source=spec, therefore this refers to spec.name

- children:
    - source: spec.name # As there's no parent source here, the scope is still the resource

- source: spec.items
  children:
    - source: name # parent data is an array, therefore scope changes to its item - this refers to spec.items[0].name
    - source: details.status # refers to spec.items[0].details.status (same as above)
    - source: details # this changes scope for its children again
      children:
        source: status # this refers to spec.items[0].details.status
```

## Common Variables

Common variables are the primary means to bypass the default scoping.

- **\$root** - always contains the reference to the resource, so any JSONata in the example above can always be `$root.spec.name`.
- **\$item** - refers to the most recent array item. When not in an array, it's equal to **\$root**.
- **\$items** - contains an array of references to all parent array items (with the last item being equal to **\$item**).
- **\$value** - when used in a JSONata other than **source** (for example **visibility**, but also other widget-specific formulas), contains the value returned by the source.
- **\$index** - exists in array components, refers to the index of the current item of an array.

### Example

```yaml
- widget: Table
  source: spec.rules
  visibility: $exists($value)
  collapsibleTitle: "'Rule #' & $string($index + 1)"
```

## Data Sources

Whenever data sources are provided, they are available as corresponding variable names. For more information, see [Configure the dataSources Section](90-datasources.md).
