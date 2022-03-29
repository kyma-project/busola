---
title: Feature flags
---

The document lists and describes all the feature flags that are available in Kyma Dashboard and provides their configuration examples:

> **TIP:** The list is ordered alphabetically.

- **ADDONS** – is used to show or hide the **Addons** view and to define which APIs are required for the view to be shown properly.
  For the view to be shown, you must enable the feature. Moreover, all the APIs listed in the selectors array must be available in a cluster.

  Default settings:

  ```bash
  "ADDONS": {
    "isEnabled": true,
    "selectors": [
      {
        "type": "apiGroup",
        "apiGroup": "addons.kyma-project.io"
      }
    ]
  },
  ```

- **API_GATEWAY** – is used to show or hide the **API Gateway** view and to define which APIs are required for the view to be shown properly.
  It is also used to determine if the **API Gateway** list should be displayed in the **Function** and **Service** details.
  For the view to be shown, you must enable the feature. Moreover, all the APIs listed in the selectors array must be available in a cluster.

  Default settings:

  ```bash
  "API_GATEWAY": {
    "isEnabled": true,
    "selectors": [
      {
        "type": "apiGroup",
        "apiGroup": "gateway.kyma-project.io"
      }
    ]
  },
  ```

- **APPLICATIONS** – is used to show or hide the **Applications** view and to define which APIs are required for the view to be shown properly.
  For the view to be shown, you must enable the feature. Moreover, all the APIs listed in the selectors array must be available in a cluster.

  Default settings:

  ```bash
  "APPLICATIONS": {
    "isEnabled": true,
    "selectors": [
      {
        "type": "apiGroup",
        "apiGroup": "applicationconnector.kyma-project.io"
      }
    ]
  },
  ```

- **BTP_CATALOG** – is used to show or hide the **BTP Catalog** view and to define which APIs are required for the view to be shown properly.
  For the view to be shown, you must enable the feature. Moreover, all the APIs listed in the selectors array must be available in a cluster.

  Default settings:

  ```bash
  "BTP_CATALOG": {
    "isEnabled": true,
    "selectors": [
      {
        "type":"apiGroup",
        "apiGroup":"services.cloud.sap.com"
      }
    ]
  },
  ```

- **CUSTOM_DOMAINS** – is used to show or hide the **DNS Entry**, **DNS Provider**, **Gateway**, **Issuer**, and **Certificate** views.
  For the view to be shown, you must enable the feature. Moreover, all the APIs listed in the selectors array must be available in a cluster.

  Default settings:

  ```bash
  "CUSTOM_DOMAINS": {
    "isEnabled": true,
    "selectors": [
      {
        "type": "apiGroup",
        "apiGroup": "dns.gardener.cloud"
      }
    ]
  },
  ```

- **EVENTING** – is used to show or hide the **Eventing** view and to define which APIs are required for the view to be shown properly.
  It is also used to determine if the **Event Subscriptions** should be displayed in **Function** and **Service** details.
  For the view to be shown, you must enable the feature. Moreover, all the APIs listed in the selectors array must be available in a cluster.

  Default settings:

  ```bash
  "EVENTING": {
    "isEnabled": true,
    "selectors": [
      {
        "type": "apiGroup",
        "apiGroup": "eventing.kyma-project.io"
      }
    ]
  },
  ```

- **ISTIO** - is used to show or hide the Istio-related views and to define which APIs are required for the views to be shown properly.
  For the view to be shown, you must enable the feature. Moreover, all the APIs listed in the selectors array must be available in a cluster.

  Default settings:

  ```bash
  "ISTIO": {
    "isEnabled": true,
    "selectors": [
      {
        "type": "apiGroup",
        "apiGroup": "networking.istio.io"
      }
    ]
  },
  ```

- **JWT_CHECK_CONFIG** – is used to configure data necessary for the backend authentication, such as an issuer and JWKS (JSON Web Key Set) address. When the feature is disabled no authentication occurs on backend side.

  Backend feature. Cannot be modified at the cluster's Config Map level.

  Default settings:

  ```bash
  "JWT_CHECK_CONFIG": {
    "isEnabled": false,
    "config": {
      "issuer": "https://apskyxzcl.accounts400.ondemand.com",
      "jwksUri": "https://apskyxzcl.accounts400.ondemand.com/oauth2/certs"
    }
  }
  ```

- **GZIP** – is used to indicate whether the response from the backend server should be compressed or not.

  Backend feature. Cannot be modified at the cluster's Config Map level.

  Default settings:

  ```bash
  "GZIP": {
    "isEnabled": true,
  }
  ```

- **KUBECONFIG_ID** – is used to configure the URL to which Busola sends a request to download a kubeconfig file. If you add `?kubeconfigID={your ID}` to the Busola URL, Busola tries to download the kubeconfig from `{kubeconfigUrl}/{yourID}`. If the operation succeeds, Busola adds the kubeconfing file to the cluster.
  If you use a full address in the **kubeconfigUrl** field, Busola also reads it.

  Default settings:

  ```bash
  "KUBECONFIG_ID": {
   "isEnabled": true,
   "config": {
     "kubeconfigUrl": "https://kyma-env-broker.cp.dev.kyma.cloud.sap/kubeconfig"
   }
  },
  ```

- **LEGAL_LINKS** – is used to show or hide legal links. You can find the all available links in the following example.
  In **config** you can find the unchangeable keys (you cannot use **legalDisclosure** instead of **legal-disclosure**). The keys include both the default link, which takes you to the default address, and a link that depends on your chosen language.

  Example:

  ```bash
  "LEGAL_LINKS": {
    "config": {
      "legal-disclosure": {
        "default": "https://www.sap.com/corporate/en/legal/impressum.html",
        "de": "https://www.sap.com/corporate/de/legal/impressum.html"
      },
      "privacy": {
        "default": "https://help.sap.com/viewer/82bdf2271c6041f79387c122147cf774/Cloud/en-US"
      },
      "copyright": {
        "default": "https://www.sap.com/corporate/en/legal/copyright.html",
        "de": "https://www.sap.com/corporate/de/legal/copyright.html"
      },
        "trademark": {
          "default": "https://www.sap.com/corporate/en/legal/trademark.html",
          "de": "https://www.sap.com/corporate/de/legal/trademark.html"
      }
    }
  },
  ```

  The link under the given key is selected based on your language code (de, en, pl, etc.). If the code is not available, the default link is used.

- **OBSERVABILITY** – is used to render nodes in the navigation. The **label** parameter shows the name of the given service. The **path** parameter is used by Busola during the bootstrapping. Busola sends a request to the cluster address. The **path** value and the cluster must return the VirtualService object. If the object is found, you receive an address to which the node in the navigation leads.

  Defualt settings:

  ```bash
  "OBSERVABILITY": {
   "isEnabled": true,
   "config": {
     "links": [
       {
         "label": "Grafana",
         "path": "apis/networking.istio.io/v1beta1/namespaces/kyma-system/virtualservices/monitoring-grafana"
       },
       {
         "label": "Kiali",
         "path": "apis/networking.istio.io/v1beta1/namespaces/kyma-system/virtualservices/kiali"
       },
       {
         "label": "Tracing",
         "path": "apis/networking.istio.io/v1beta1/namespaces/kyma-system/virtualservices/tracing"
       }
     ]
   }
  }
  ```

- **PROTECTED_RESOURCES** – is used to block the edit and delete functions based on the determined rules. If the resource meets the rule requirements, the resource becomes protected and cannot be edited/deleted.
  Each resource requires the **match** field, which includes a list of key-value pairs. The proper rule description is when the definition given in the key matches the value.

  To switch comparison mode from **standard** to **regex**, set the **regex** parameter to `true`.

  Optionally, you can provide the **message** parameter, which displays a simple message, or **messageSrc**, which is a yaml path where the message to be displayed is included. If neither **message** nor **messageSrc** is provided, a generic message is used.

  Example:

  ```bash
  "PROTECTED_RESOURCES": {
    "isEnabled": true,
    "config": {
      "resources": [
        {
          # matches a resource with label "foo" equal to "bar"
          "match": {
            "$.metadata.labels.foo": "bar"
          },
          # message to display in the tooltip
          "message": "This resource is protected"
        },
        {
          # matches a resource with both label "foo" equal to "bar" and label "baz" equal to "qux"
          "match": {
            "$.metadata.labels.foo": "bar",
            "$.metadata.labels.baz": "qux"
          },
          # source of the message to display in the tooltip
          "messageSrc": "$.metadata.annotations.protected-message"
        },
        {
          # matches a resource with label "foo" equal to alphanumeric value
          "match": {
            "$.metadata.labels.foo": "^[a-zA-Z0-9]$"
          },
          # allows comparison by regex
          "regex": true
          # if neither "message" or "messageSrc" is given, a generic message is used (from i18n files - key: common.protected-resource)
        }
      ]
    }
  }
  ```

The **match** keys and **messageSrc** must use the format described in the [`jsonpath` repository](https://github.com/dchester/jsonpath).

- **SENTRY** – is used to enable monitoring of uncaught exceptions, which then are analyzed and repaired. The address to which you send the information is located under the **dsn** key.

  Default settings:

  ```bash
  "SENTRY": {
    "isEnabled": false,
    "selectors": [],
    "config": {
      "dsn": ""
    }
  },
  ```

- **SERVERLESS** – is used to show or hide the **Serverless** view and to define which APIs are required for the view to be shown properly.
  For the view to be shown, you must enable the feature. Moreover, all the APIs listed in the selectors array must be available in a cluster.

  Default settings:

  ```bash
  "SERVERLESS": {
    "isEnabled": true,
    "selectors": [
      {
        "type": "apiGroup",
        "apiGroup": "serverless.kyma-project.io"
      }
    ]
  },
  ```

  > NOTE: Both **SERVICE_CATALOG** and **SERVICE_CATALOG_ADDONS** features are used to determine if **Service Bindings** (in the **Configuration** tab) and environment variables injected by **Service Bindings** (in the **Code** Tab) are displayed in the **Functions** view.

- **SERVICE_CATALOG** – is used to show or hide the **Service Catalog** views (**Catalog**, **Instances**, and **Brokers**) and to define which APIs are required for the view to be shown properly.
  For the view to be shown, you must enable the feature. Moreover, all the APIs listed in the selectors array must be available in a cluster.

  Default settings:

  ```bash
  "SERVICE_CATALOG": {
    "isEnabled": true,
    "selectors": [
      {
        "type": "apiGroup",
        "apiGroup": "servicecatalog.k8s.io"
      }
    ]
  },
  ```

- **SERVICE_CATALOG_ADDONS** – is used to show or hide the **Service Catalog Addons** view and to define which APIs are required for the view to be shown properly.
  For the view to be shown, you must enable the feature. Moreover, all the APIs listed in the selectors array must be available in a cluster.

  Default settings:

  ```bash
  "SERVICE_CATALOG_ADDONS": {
    "isEnabled": true,
    "selectors": [
      {
        "type": "apiGroup",
        "apiGroup": "servicecatalog.kyma-project.io"
      }
    ]
  },
  ```

- **SHOW_KYMA_VERSION** – determines if the Kyma version should be visible on the Cluster Details page. The displayed version is the value of the `reconciler.kyma-project.io/origin-version` label in the `kyma-system` Namespace. If the value of the label is missing or there is no `kyma-system` Namespace, the `Unknown` version will be displayed.

  ```bash
  "SHOW_KYMA_VERSION": {
    "isEnabled": true
  },
  ```

- **SSO_LOGIN** – is used to configure data necessary for the SSO login such as an issuer address, client’s ID, and scopes.

  ```bash
  "SSO_LOGIN": {
    "isEnabled": true,
    "config": {
      "issuerUrl": "https://kymatest.accounts400.ondemand.com",
      "scope": "openid",
      "clientId": "9bd05ed7-a930-44e6-8c79-e6defeb7dec9"
    }
  },
  ```

- **PROMETHEUS** – is used to show or hide the **Prometheus** metrics graphs. You can configure which endpoint exposes the metrics data in the **path** field.

  ```bash
  "PROMETHEUS": {
    "isEnabled": true,
    "config": {
      "path": "api/v1/namespaces/kyma-system/services/monitoring-prometheus:web/proxy/api/v1"
    }
  },
  ```

- **VISUAL_RESOURCES** – determines if the resource graphs should be rendered at a resource details view.

  ```bash
  "VISUAL_RESOURCES": {
    "isEnabled": true,
  },
  ```
