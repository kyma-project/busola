export function createServiceInstanceTemplate(namespaceId) {
  return {
    apiVersion: 'services.cloud.sap.com/v1',
    kind: 'ServiceInstance',
    metadata: {
      name: '',
      namespace: namespaceId,
      labels: {},
    },
    spec: {
      externalName: '',
      serviceOfferingName: '',
      servicePlanName: '',
      parameters: {},
    },
  };
}
