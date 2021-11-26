---
title: Feature flags
---

Below you can find a description of all the feature flags that are available in Busola dashboard and their configuration examples:

> **TIP:** The list is ordered alphabetically.

- **ADD_CLUSTER_DISABLED** – is used to enable or disable adding a cluster. If the function is enabled, you can only add your cluster in the BTP cockpit using the KUBECONFIG_ID feature. Link to the cockpit is configured under cockpitUrl.

Default settings:

```bash
"ADD_CLUSTER_DISABLED":{
  "isEnabled": false,
  "config": {
    "cockpitUrl":"https://account.staging.hanavlab.ondemand.com/cockpit"
  }
},
```

- **ADDONS** – is used to show or hide the Addons view as well as to define which Custom Resource Definitions (CRD) are required for the view to be shown properly.
  For the view to be shown, the feature must be enabled and all CRDs, defined in the selectors array, must exist in a cluster.

Default settings:

```bash
"ADDONS ":{
  "isEnabled": true,
  "selectors":[
    {
      "type":"apiGroup",
      "apiGroup":"addons.kyma-project.io"
    }
  ]
},
```

- **API_GATEWAY** – is used to show or hide the Api Gateway view as well as to define which Custom Resource Definitions (CRD) are required for the view to be shown properly.
  For the view to be shown, the feature must be enabled and all CRDs, defined in the selectors array, must exist in a cluster.

Default settings:

```bash
"API_GATEWAY ":{
  "isEnabled": true,
  "selectors":[
    {
      "type":"apiGroup",
      "apiGroup":"gateway.kyma-project.io"
    }
  ]
},
```

- **APPLICATIONS** – is used to show or hide the Applications view as well as to define which Custom Resource Definitions (CRD) are required for the view to be shown properly.
  For the view to be shown, the feature must be enabled and all CRDs, defined in the selectors array, must exist in a cluster.

Default settings:

```bash
"APPLICATIONS":{
  "isEnabled": true,
  "selectors":[
    {
      "type":"apiGroup",
      "apiGroup":"applicationconnector.kyma-project.io"
    }
  ]
},
```

- **BTP_CATALOG** – is used to show or hide the BTP Catalog view as well as to define which Custom Resource Definitions (CRD) are required for the view to be shown properly.
  For the view to be shown, the feature must be enabled, and all CRDs, defined in the selectors array, must exist in a cluster.

Default settings:

```bash
"BTP_CATALOG":{
  "isEnabled": true,
  "selectors":[
    {
      "type":"apiGroup",
      "apiGroup":"services.cloud.sap.com"
    }
  ]
},
```

- **CUSTOM_DOMAINS** – is responsible for displaying views of DNS Entry, DNS Provider, Gateway, Issuer and Certificate. Its functions can be visible only if all Custom Resource Defintions, defined in the selectors array, exist in a cluster.

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

- **EVENTING** – is used to show or hide the Eventing view as well as to define which Custom Resource Definitions (CRD) are required for the view to be shown properly.
  For the view to be shown, the feature must be enabled and all CRDs, defined in the selectors array, must exist in a cluster.

Default settings:

```bash
"EVENTING ":{
  "isEnabled": true,
  "selectors":[
    {
      "type":"apiGroup",
      "apiGroup":"eventing.kyma-project.io"
    }
  ]
},
```

- **KUBECONFIG_ID** – is used to configure URL to which Busola sends a request to download a kubeconfig file. If we add `?kubeconfigID={your ID}` to the Busola URL then Busola tries to download the kubeconfig from the {kubeconfigUrl}/{yourID} and, if succedded, will add a cluster.
  You can introduce the whole address in the kubeconfigUrl which will also be read by Busola.

Default settings:

```bash
"KUBECONFIG_ID": {
 "isEnabled": true,
 "config": {
   "kubeconfigUrl": "https://kyma-env-broker.cp.dev.kyma.cloud.sap/kubeconfig"
 }
},
```

- **LEGAL_LINKS** – is used to show or hide legal links. You can find all available links in the below example.  
  In config you can find the unchangeable keys (you cannot use legalDisclosure instead of legal-disclosure). The keys include the default link, which takes you to the default address, and a link that depends on your chosen language.

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

A link under the given key will be selected based on your language code (de, en, pl, etc.), If the code is not available, the default link is used.

- **OBSERVABILITY** – is used to render a few nodes in the navigation. The label shows the name of the given service. The path is used by Busola during the bootstrapping. Busola sends a request to the cluster address + the path and the cluster must return the virtualService object. If the object is found you receive an address to which the node in the navigation leads.

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
  Each resource must have a match field, which is the list of key-value pairs. The proper rule description is when the definition given in the key matches the value.

  Optionally you can provide a message parameter, which displays a simple message, or messageSrc, which is a yaml path where the message to be displayed is included. If neither message nor messageSrc is provided, a generic message will be used.

Example:

```bash
"PROTECTED_RESOURCES": {
  "isEnabled":true,
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
        "match": {
          "$.metadata.labels.foo": "bar"
        }
        # if neither "message" or "messageSrc" is given, a generic message will be used (from i18n files - key: common.protected-resource)
      }
    ]
  }
}
```

The match keys and messageSrc must use format as described at
<https://github.com/dchester/jsonpath>.

- **SENTRY** – is used to enable monitoring of uncaught exceptions, which then are analyzed and repaired. The address to which you send the information is located under the dsn key.

Default settings:

```bash
"SENTRY ":{
  "isEnabled": false,
  "selectors":[ ],
  "config": {
    "dsn":""
  }
},
```

- **SERVERLESS** – is used to show or hide the Serverless view as well as to define which Custom Resource Definitions (CRD) are required for the view to be shown properly.
  For the view to be shown, the feature must be enabled and all CRDs, defined in the selectors array, must exist in a cluster.

Default settings:

```bash
"SERVERLESS ":{
  "isEnabled": true,
  "selectors":[
    {
      "type":"apiGroup",
      "apiGroup":"serverless.kyma-project.io"
    }
  ]
},
```

- **SERVICE_CATALOG** – is used to show or hide the Service Catalog view as well as to define which Custom Resource Definitions (CRD) are required for the view to be shown properly.
  For the view to be shown, the feature must be enabled and all CRDs, defined in the selectors array, must exist in a cluster.

Default settings:

```bash
"SERVICE_CATALOG":{
  "isEnabled": true,
  "selectors":[
    {
      "type":"apiGroup",
      "apiGroup":"servicecatalog.k8s.io"
    }
  ]
},
```

- **SERVICE_CATALOG_ADDONS** – is used to show or hide the Service Catalog Addons view as well as to define which Custom Resource Definitions (CRD) are required for the view to be shown properly.
  For the view to be shown, the feature must be enabled and all CRDs, defined in the selectors array, must exist in a cluster.

Default settings:

```bash
"SERVICE_CATALOG_ADDONS ":{
  "isEnabled": true,
  "selectors":[
    {
      "type":"apiGroup",
      "apiGroup":"servicecatalog.kyma-project.io"
    }
  ]
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
