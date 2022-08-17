const DRConfig = `{
  "details": {
    "header": [],
    "body": [
      {
        "name": "references",
        "widget": "Panel",
        "children": [
          {
            "path": "spec.host",
            "type": "string",
            "name": "Host"
          },
          {
            "path": "spec.exportTo",
            "widget": "JoinedArray",
            "separator": ", "
          }
        ]
      },
      {
        "path": "spec.trafficPolicy",
        "widget": "CodeViewer",
        "visibility": "$exists($.data)"
      },
      {
        "path": "spec.subset",
        "widget": "CodeViewer",
        "visibility": "$exists($.data)"
      },
      {
        "path": "spec.workloadSelector",
        "widget": "CodeViewer",
        "visibility": "$exists($.data)"
      }
    ]
  },
  "form": [
    {
      "simple": true,
      "path": "spec.host"
    }
  ],
  "general": {
    "resource": {
      "kind": "DestinationRule",
      "group": "networking.istio.io",
      "version": "v1beta1"
    },
    "name": "Destination Rules",
    "category": "Istio",
    "urlPath": "destinationrules",
    "scope": "namespace",
    "description": "resource.description"
  },
  "list": [
    {
      "path": "spec.host",
      "name": "Host"
    }
  ],
  "translations": {
    "en": {
      "metadata.annotations": "Annotations",
      "metadata.labels": "Labels",
      "metadata.creationTimestamp": "Created at",
      "resource.description": "{{[Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule)}} specifies rules that apply to traffic intended for a service after routing.",
      "references": "References",
      "spec.exportTo": "Exported To Namespaces",
      "spec.host": "Host",
      "spec.trafficPolicy": "Traffic Policy",
      "spec.subset": "Subset",
      "spec.workloadSelector": "Workload Selector"
    }
  }
}
`;

export const destinationRules = JSON.parse(DRConfig);
