# Extensibility

## Overview

With Busola's extensibility feature, you can create a dedicated user interface (UI) page for your CustomResourceDefinition (CRD). It enables you to add navigation nodes, on cluster or namespace level, and to configure your [UI display](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/30-details-summary.md), for example, a resource list page, and details pages. You can also [create and edit forms](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/40-form-fields.md). To create a UI component, you need a ConfigMap.

You can also leverage Busola's [custom extension feature](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/80-custom-extensions.md) to design entirely custom user interfaces tailored to your specific needs.

## Create a ConfigMap for Your UI

To create a ConfigMap with your CRD's UI configuration, you can either use the Extensions feature or do it manually.

> [!TIP]
> For more information about extensibility in Busola, see the [`extensibility folder`](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility) in the Busola repository.

### Create a CRD ConfigMap Using the Extensions Feature

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
3. Enter the ConfigMap's **Name**.
4. In the **Labels** section, enter two labels:
   - `busola.io/extension` as the key and `resource` as the value
   - `busola.io/extension-version`as the key and `'0.5'` as the value
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

> [!TIP]
> To see an example configuration of the Busola extensibility feature, check the [Pizza example](https://github.com/kyma-project/busola/blob/main/examples/pizzas/README.md).

## Related Information

[Configure a List Page](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/20-list-columns.md)
[Configure a Details Page](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/30-details-summary.md)
[Configure Create and Edit Pages](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/40-form-fields.md)
[List and Details Widgets](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/50-list-and-details-widgets.md)
[Form Widgets](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/60-form-widgets.md)
[Widget Injection](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/70-widget-injection.md)
[Custom Extensions](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/80-custom-extensions.md)
[Configure the dataSources Section](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/90-datasources.md)
[Use JSONata Expressions with Resource-Based Extensions](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/100-jsonata.md)
[Use JSONata Preset Functions for Resource-Based Extensions](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/101-jsonata-preset-functions.md)
[Configure the presets Section](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/110-presets.md)
[Configure a Config Map for Resource-Based Extensions](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/120-resource-extensions.md)
[Additional Sections for Resource-Based Extensions](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/130-additional-sections-resources.md)
[Configure a Config Map for Static Extensions](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/140-static-extensions.md)
[Configure Translations](https://github.com/kyma-project/busola/blob/main/docs/contributor/extensibility/150-translations.md)
