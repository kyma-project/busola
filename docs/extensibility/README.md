# Extensibility

## Overview

With Busola's extensibility feature, you can create a dedicated user interface (UI) page for your CustomResourceDefinition (CRD). It enables you to add navigation nodes, on cluster or namespace level, and to configure your [UI display](display-section.md), for example, a resource list page, and details pages. You can also [create and edit forms](form-section.md). To create a UI component, you need a ConfigMap.

## Create a ConfigMap for Your UI

To create a ConfigMap with your CRD's UI configuration, you can either use the Extensions feature or do it manually.

For more information about extensibility in Busola, see [Config Map for resource-based extensions](resources.md).

### Create a CRD ConfigMap Using the Extentions Feature

> [!NOTE]
> Using the Extensions feature, you can't change the namespace where the UI component is created or edit the ConfigMap's name. If you want to create the ConfigMap in a different namespace, create the ConfigMap manually.

1. In Kyma dashboard, in the cluster view, choose **Configuration > Extensions** and click **Create**.

2. Complete the following fields:

   - **Resource** - choose your module's resource from the list of resources existing in the cluster
   - **Name** - enter the UI component name displayed in the Kyma dashboard navigation
   - **Category** - enter the UI component category displayed in the Kyma dashboard navigation

3. The CustomResourceDefinition (CRD) of the chosen resource predefines the details that appear in the following sections:

   - **Form Fields** - defines fields visible in the edit and create pages.
   - **List Columns** - defines columns visible on the UI component's entry page, also known as the list page. The **Name** and **Created** columns are added by default.
   - **Details Summary** - defines fields visible in the body of the details page of specific CRs. You can access the details page by clicking on a specific resource on the list page.

   You can delete those parameters that you find irrelevant to your use case.

   > [!NOTE]
   > Not all of the predefined CRD parameters are used during the ConfigMap creation.

4. Click **Create**.

### Create a CRD ConfigMap Manually

1. In Kyma dashboard, choose a namespace.
2. Go to **Configuration** > **Config Maps** and click **Create**.
3. Enter the Config Map's **Name**.
4. In the **Labels** section, enter two labels:
   - `busola.io/extension` as the key, and `resource` as the value
   - `busola.io/extension-version`as the key, and `'0.5'` as the value
5. Under **Data**, add the following required fields for your module's UI configuration:

   ```yaml
   general:
     resource:
       kind:
       version:
       group:
     name:
     category:
     scope:
     urlPath:
   ```

6. Click **Create**.

To see an exemplary configuration of the Busola extensibility feature, check the [Pizza example](examples/../../../examples/pizzas/README.md).
