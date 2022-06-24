# Extensibility

## Overview

Extensibility in Busola is a feature that allows you to create a separate dedicated user interface (UI) page for your Custom Resource Definition (CRD). It allows you to add navigation nodes, on Cluster or Namespace level, and to configure your resource list page, details pages, as well as create and edit forms. You can also add [display](display-widgets.md) and [form](form-widgets.md) widgets to have a graphical representation of the elements.

## Quick start

To automatically add the UI page for your CRD, follow these steps:

1.  In the **Cluster Details** view, go to **Configuration > Custom Resource Definitions** and click on your CRD.
2.  Click **Create UI +**, and provide **Name** and **Category**.
3.  Optionally, you can uncheck the UI elements that are not necessary.

> **NOTE:** The UI elements visible in this form are only suggestions. You can change the configuration later in your Config Map.

4.  Click **Create**.

## Create a CRD Config Map

To create your CRD Config Map, follow these steps:

1. Go to the `kube-public` Namespace and choose **Configuration > Config Maps**.
2. Click **Create Config Map +** and enter the name of your Config Map.
3. Under the **Data** form, you can add the required fields to define how to handle your CRD.
4. Go to the **Advanced** tab and in the **Labels** form enter `busola.io/extension` as a key, and `resource` as a value.

> **NOTE:** Do not overwrite the existing name label.

5. Click **Create**.

For more information about extensibility in Busola, visit [Config Map for resource-based extensions](resources.md).
