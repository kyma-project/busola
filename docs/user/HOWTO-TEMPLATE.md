---
title: Managing <Resource Type>
---

# Managing <Resource Type>

One paragraph: what this resource is and why you'd manage it via the Kyma Dashboard.

## Prerequisites

- Access to a Kyma cluster via Kyma Dashboard
- <Kyma module if required, e.g. "Serverless module installed and in Ready state">

## Procedure

### Create a <Resource>

1. In the top-left namespace dropdown in the left sidebar, select namespace **default** (or the namespace where you want to create the resource).

2. In the left sidebar, expand **\<Section\>** and click **\<Resource type\>**.

3. Click **Create**.

4. In the **Create \<Resource\>** panel, click the **YAML** tab.

5. Replace the default content with the following manifest:

   ```yaml
   <sample YAML with human-readable name, e.g. "my-first-<resource>" or "hello-world-<resource>">
   ```

6. Click **Create**.

   **Result**: The dashboard navigates to the detail view for `<name>`. \<Describe what the user sees — status, pods, conditions.\>

### View \<Resource\> Details

Describe the key cards/sections visible in the detail view and what information they contain.

### \<Operation 2, e.g. Edit / Scale / Trigger\>

Numbered steps. Reference UI labels exactly as shown in the dashboard.

**Result**: Describe what changes in the UI after the operation.

### Delete a \<Resource\>

1. Navigate to the resource detail view.
2. Click **Delete** in the detail panel header.
3. In the **Delete \<Resource\>** confirmation dialog, click **Delete**.

   **Result**: The dashboard returns to the list. The entry for `<name>` is no longer present.

## Related resources

- [Link to related guide once it exists]
- [Upstream Kubernetes/Kyma documentation link]

---

<!-- AGENT NOTES — remove before committing
Naming convention: use human-readable names like "my-first-deployment", "hello-world-function",
"my-first-apirule". Never use generated suffixes or UUIDs.

Pod/resource name suffixes: when referencing auto-generated names (e.g. pod names), write
"<resource-name>-<suffix>" rather than a real hash.

UI labels: copy exact button/tab/section names as shown in the dashboard. Do not use aria-labels
or DOM attribute values — only what a user can visually read.

After-each-step result: every meaningful action (Create, Save, Delete, scale) must be followed by
a "Result:" line describing what the user sees in the UI.

Verified live: every step must have been performed in the dashboard before being written.
-->
