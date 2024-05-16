## Widget _injections_ overview

The **Injections** section contains a list of objects that defines the display structure of the current extension on a different view. Each object is a separate **injection** that will be injected on a specified view at a specified slot.

### Available _injections_ section parameters

- **source** - _[required]_ contains a [JSONata](jsonata.md) expression used to fetch data for the column. In its simplest form, it's the path to the value.
- **name** - an optional name for the field instead of the default capitalized last part of the path. This can be a key from the **translation** section.
- **widget** - an optional widget used to render the field referred to by the **source** property. The widget should be adjusted to handle arrays.
- **order** - a number that defines in what order injections will be rendered. If one or more injections have the same order, they will be sorted by name.
- **targets** - an array of targets
  - **location** - _[required]_ defines on what view the injection should be rendered. Currently, injections are rendered only on details views. For more information, check the list of [all available locations](#all-available-injections-locations)
  - **slot** - _[required]_ defines where the injection should be rendered on a page. Check the list of [all available slots](#all-available-injections-slots)
  - **filter** - a JSONata expression that filters resources based on a given condition. If defined, it overrides the general filter.
- **filter** - a JSONata expression that filters resources based on a given condition. This is a general filter rule. If **filter** is defined in **targets**, it will be ignored.

### All available _injections_ slots

- **details-bottom** - At the bottom of the resource view
- **details-header** - In the header of the details view
- **details-top** - At the top of the resource view
- **list-header** - In the header of the list view

### All available _injections_ locations

#### Special views

- ClusterOverview (only supports the **details-\*** slots)
- CustomResourceDefinitions

#### Resource views

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

#### Extension views

Use a lowercase pluralized **general.resource.kind** as the **location** for injections into resources handled by another extension.

### _injections_ example

```
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

Here's an example of an injection for a wizard in the function view:

```
injections: |-
  - name: Get started with functions
    widget: Wizard
    wizard: serverless-wizard
    targets:
      - location: functions
        slot: list-header
```
