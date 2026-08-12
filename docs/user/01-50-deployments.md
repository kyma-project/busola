---
title: Managing Deployments
---

# Managing Deployments

A Deployment is a Kubernetes resource that manages a set of identical Pods, keeping a specified number running at all times and rolling out updates in a controlled way. This guide shows you how to create, inspect, scale, and delete a Deployment using the Kyma Dashboard.

## Prerequisites

- Access to a Kyma cluster via Kyma Dashboard

## Procedure

### Create a Deployment

1. In the top-left **Namespaces** dropdown in the left sidebar, select the namespace where you want to create the Deployment. This guide uses `default`.

2. In the left sidebar, expand **Workloads** and click **Deployments**.

3. Click **Create** in the top-right area of the Deployments list.

4. In the **Create Deployment** panel that opens on the right, click the **YAML** tab in the segmented button group at the top of the panel.

5. Select all content in the YAML editor and replace it with the following manifest:

   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: hello-world-deployment
     namespace: default
     labels:
       app: nginx
   spec:
     replicas: 2
     selector:
       matchLabels:
         app: nginx
     template:
       metadata:
         labels:
           app: nginx
       spec:
         containers:
           - name: nginx
             image: nginx:1.14.2
             ports:
               - containerPort: 80
   ```

6. Click **Create** at the bottom of the panel.

   The dashboard navigates to the detail view for `hello-world-deployment`. Under the **Pod** section you can see both pods appearing. Within a few seconds their status changes from **Container Creating** to **Running**.

### View Deployment Details and Pods

After creating the Deployment, the detail panel opens automatically. You can also reach it by clicking the Deployment name in the Deployments list.

The detail panel contains:

- **Resource Details** — Metadata (age, labels, annotations) and **Status** (replica counts, conditions). When all replicas are ready, **Available** shows `True`.
- **Pod** section (inside the **Selector** card) — lists the Pods managed by this Deployment, each with its name, creation time, status, and restart count. Both pods show status **Running** once they are ready.
- **Pod Template** card — shows the container image, image pull policy, and exposed ports.
- **Events** section — shows lifecycle events such as the replica scale-up message.

To open the Deployments list from any page, click **Deployments** in the left sidebar under **Workloads**.

### View Pod Logs

1. In the **Pod** section of the Deployment detail panel, click the name of any pod listed, for example `hello-world-deployment-<suffix>`. This opens the Pod detail panel.

2. Scroll to the **Containers** card. You see the `nginx` container listed with its status, image, and ports.

3. Click the log icon to the right of the container name. The dashboard navigates to the **Logs** page for that container.

   The Logs page shows:
   - A **Filter timeframe by** dropdown (default: `6 hours`)
   - A **Show Timestamps** toggle
   - A **Reverse logs** toggle
   - A **Save to a file** button
   - The log output below, or a message such as `No logs available for the 'nginx' container` if the container has not yet produced any output.

### Scale a Deployment

1. Navigate to the Deployment detail view and click the **Edit** tab at the top of the detail panel.

2. In the edit panel, click the **YAML** tab in the segmented button group.

3. In the YAML editor, locate the `replicas` field under `spec` and change its value from `2` to `3`:

   ```yaml
   spec:
     replicas: 3
   ```

4. Click **Save** at the top of the panel.

   The dashboard switches back to the **View** tab. The **Status** card updates: **Replicas** shows `3` and **Available Replicas** shows `3`. A third pod appears in the **Pod** section with status **Running**. The **Events** section shows a new entry: `Scaled up replica set hello-world-deployment-<suffix> from 2 to 3`.

### Delete a Deployment

1. Navigate to the Deployment detail view.

2. Click **Delete** in the header of the detail panel.

3. In the **Delete Deployment** confirmation dialog, click **Delete**.

   The dashboard returns to the Deployments list. The entry for `hello-world-deployment` is no longer present. The pods managed by the Deployment terminate automatically.

## Related resources

- [Kubernetes Deployments documentation](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
