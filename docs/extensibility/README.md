# Extensibility

## Overview

Extensibility in Busola is a feature that allows you to create a separate dedicated user interface (UI) page for your CustomResourceDefinition (CRD). It allows you to add navigation nodes, on Cluster or Namespace level, and to configure your resource list page, details pages, as well as create and edit forms. You can also add [display](display-section.md) and [form](form-sections.md) widgets to have a graphical representation of the elements.

## CRD ConfigMap wizard

To automatically add the UI page for your CRD, follow these steps:

1.  In the **Cluster Details** view, go to **Configuration > Extensions**.
2.  Click **Create Extension +**, and select your resource from the list.
3.  Optionally, you can uncheck the UI elements that are not necessary.

> **NOTE:** The UI elements visible in this form are only suggestions. You can change the configuration later in your ConfigMap.

4.  Click **Create**.

## Create a custom CRD ConfigMap

To create your CRD ConfigMap, follow these steps:

1. Go to the `kube-public` Namespace and choose **Configuration > Config Maps**.

> **NOTE:** You can choose your Namespace, but the `kube-public` Namespace is recommended.

1. Click **Create Config Map +** and enter the name of your ConfigMap.
2. Under **Data**, add the required fields to define how to handle your CRD.
3. Go to the **Advanced** tab and in the **Labels** form enter `busola.io/extension` as a key, and `resource` as a value.

> **NOTE:** Do not overwrite the existing name label.

5. Click **Create**.

For more information about extensibility in Busola, visit [Config Map for resource-based extensions](resources.md).
