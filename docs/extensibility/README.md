# Extensibility

## Overview

Extensibility in Busola allows you to create a UI page for your Custom Resource Defintion (CRD). You can create it at a cluster or Namespace level. To configure the UI page of your CRD, you can add navigation nodes, lists, and details pages, as well as create and edit forms. You can also add [display](display-widgets.md) and [form](form-widgets.md) to have a graphical representation of the elements.

## Get started

To quickly add the UI page for your CRD, follow these steps:

1.  In the **Cluster Details** view, go to **Configuration > Custom Resource Defintions** and click on your CRD.
2.  Click **Create UI +**, and provide **Name** and **Category**.
3.  Optionally, you can uncheck the UI elements that are not necessary.

Alternatively, you can create a Config Map in the `kube-public` Namespace with a label `busola.io/extension=resource`, and add the required fields to define how to handle your CRD. For more information, visit [Config Map Sections](configmap-sections.md).
