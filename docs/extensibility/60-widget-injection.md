# Widget Injection

The **injections** section contains a list of objects that defines the display structure of the current extension in a different view. Each object is a separate **injection** that will be injected in the specified view at a specified slot.

## Available _injections_ section parameters

These are the available **injections** widget parameters:

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| **source** | Yes | [JSONata](jsonata.md) expression | Fetches data for the column. In its simplest form, it's the path to the value. |
| **name** | No | | The name for the field instead of the default capitalized last part of the path. This can be a key from the **translation** section. |
| **widget** | No | | The widget used to render the field referred to by the **source** property. The widget should be adjusted to handle arrays. |
| **order** | | integer | Defines in what order injections are rendered. If one or more injections have the same order, they are sorted by name. |
| **targets** | | array of targets | |
| **targets.location** | Yes | | Defines on what view the injection should be rendered. Currently, injections are rendered only on details views. For more information, check the list of [available locations](#available-injections-locations). |
| **targets.slot** | Yes | | Defines where the injection should be rendered on a page. Check the list of [available slots](#available-injections-slots). |
| **targets.filter** | | JSONata expression | Filters resources based on a given condition. If defined, it overrides the general filter. |
| **filter** | | JSONata expression | Filters resources based on a given condition. This is a general filter rule. If **filter** is defined in **targets**, it is ignored. |

## Available **injections** Slots

- **details-bottom** - At the bottom of the resource view
- **details-header** - In the header of the details view
- **details-top** - At the top of the resource view
- **list-header** - In the header of the list view

## Available **injections** Locations

### Special Vews

- ClusterOverview (only supports the **details-\*** slots)
- CustomResourceDefinitions

### Resource Views

- Certificates
- ClusterRoleBindings
- ClusterRoles
- ConfigMaps
- CronJobs
- DaemonSets
- Deployments
- Events
- HorizontalPodAutoscalers
- Ingresses
- Jobs
- Namespaces
- NetworkPolicies
- OAuth2Clients
- PersistentVolumeClaims
- PersistentVolumes
- Pods
- ReplicaSets
- RoleBindings
- Roles
- Secrets
- ServiceBindings
- ServiceInstances
- Services
- StatefulSets

### Extension Views

Use lowercase pluralized **general.resource.kind** as the **location** for injections into resources handled by another extension.

See the following example:

```yaml
injections: |-
  - name: Failing API Rules
    widget: Table
    source: \$root
    targets:
      - slot: details-top
        location: ClusterOverview
      - slot: details-bottom
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
          critical:
            - 'ERROR'
            - 'SKIPPED'
        source: 'status.APIRuleStatus.code ? status.APIRuleStatus.code : "UNKNOWN"'
        description: status.APIRuleStatus.desc
```

This is an example of an injection for a wizard in the **Function** view:

```yaml
injections: |-
  - name: Get started with functions
    widget: Wizard
    wizard: serverless-wizard
    targets:
      - location: functions
        slot: list-header
```
