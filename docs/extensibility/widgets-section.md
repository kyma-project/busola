# Widgets with extensibility

- [_Widgets_ overview](#widgets-overview)
- [Item parameters](#item-parameters)
- [All available slots](#all-available-slots)
- [All available locations](#all-available-locations)
- [Example](#example)

## Widgets overview

The **widgets** section contains a list of objects that defines the display structure of current extension on different view. Each object is a separate **widget** that will be injected on specified view at specified slot.

## Item parameters

- **source** - _[required]_ contains a [JSONata](jsonata.md) expression used to fetch data for the column. In its simplest form, it's the path to the value.
- **name** - an optional name for the field instead of the default capitalized last part of the path. This can be a key from the **translation** section.
- **widget** - optional widget used to render the field referred to by the **source** property. The widget should be adjusted to handle arrays.
- **order** - number that defines in what order widgets will be rendered. If one or more widgets have the same order, they will be sorted by name.
- **targets** - array of targets
  - **slot** - _[required]_ defines what place on page the widget should be rendered on. Check the list of [all available slots](#all-available-slots)
  - **location** - _[required]_ defines what view the widget should be rendered on. Currently widgets are rendered only on details views. For more information check the list of [all available locations](#all-available-locations)
  - **filter** - JSONata expression that filters resources based on a given condition. If defined it overrides general filter.
- **children** - child widgets used for grouping. Child paths are relative to its parent.
- **filter** - JSONata expression that filters resources based on a given condition. This is a general filter rule. If **filter** is defined in **targets** it will be ignored.

## All available slots

- **top** - At the top of the view
- **bottom** - At the bottom of the view

## All available locations

- **ClusterOverview**
- **Deployments**
- **Pods**

## Example

```yaml
widgets: |-
  - name: Failing API Rules
    widget: Table
    source: $root
    targets:
      - slot: top
        location: ClusterOverview
      - slot: bottom
        location: ClusterOverview
        filter: '$item.status.APIRuleStatus.code="OK"'
    filter: '$item.status.APIRuleStatus.code="ERROR"'
    order: 2
    children: 
      - name: Name
        source: metadata.name
        widget: Text
      - name: Namespace
        source: metadata.namespace
        widget: Text
      - name: status
        widget: Badge
        highlights: 
          positive:
            - 'OK'
          negative:
            - 'ERROR'
          critical:
            - 'SKIPPED'
        source: 'status.APIRuleStatus.code ? status.APIRuleStatus.code : "UNKNOWN"'
        description: status.APIRuleStatus.desc
```
