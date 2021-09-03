import * as jp from 'jsonpath';

export function serviceInstanceToYaml(serviceInstance) {
  return {
    apiVersion: 'services.cloud.sap.com/v1alpha1',
    kind: 'ServiceInstance',
    metadata: {
      name: serviceInstance.name,
      namespace: serviceInstance.namespace,
      labels: serviceInstance.labels,
    },
    spec: {
      externalName: serviceInstance.externalName,
      serviceOfferingName: serviceInstance.serviceOfferingName,
      servicePlanName: serviceInstance.servicePlanName,
      parameters: JSON.parse(serviceInstance.parameters),
    },
  };
}

export function yamlToServiceInstance(yaml) {
  return {
    name: jp.value(yaml, '$.metadata.name') || '',
    namespace: jp.value(yaml, '$.metadata.namespace') || '',
    labels: jp.value(yaml, '$.metadata.labels') || '',
    externalName: jp.value(yaml, '$.spec.externalName') || '',
    serviceOfferingName: jp.value(yaml, '$.spec.serviceOfferingName') || '',
    servicePlanName: jp.value(yaml, '$.spec.servicePlanName') || '',
    parameters:
      JSON.stringify(jp.value(yaml, '$.spec.parameters' || {}), null, 2) || '',
  };
}

export function createServiceInstanceTemplate(namespaceId) {
  return {
    name: '',
    namespace: namespaceId,
    labels: {},
    externalName: '',
    serviceOfferingName: '',
    servicePlanName: '',
    parameters: `{
  
}
`,
  };
}
