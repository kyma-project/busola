export function createServiceBindingTemplate(namespaceId) {
  return {
    apiVersion: 'services.cloud.sap.com/v1alpha1',
    kind: 'ServiceBinding',
    metadata: {
      name: '',
      namespace: namespaceId,
      labels: {},
    },
    spec: {
      serviceInstanceName: '',
      externalName: '',
      secretName: '',
      parameters: {},
      parametersFrom: [],
    },
  };
}
