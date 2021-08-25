import * as jp from 'jsonpath';

export function serviceBindingToYaml(serviceBinding) {
  return {
    apiVersion: 'services.cloud.sap.com/v1alpha1',
    kind: 'ServiceBinding',
    metadata: {
      name: serviceBinding.name,
      namespace: serviceBinding.namespace,
      labels: serviceBinding.labels,
    },
    spec: {
      serviceInstanceName: serviceBinding.instanceName,
      externalName: serviceBinding.externalName,
      secretName: serviceBinding.secretName,
      // no try-catch, as params passed here should be already parseable
      parameters: JSON.parse(serviceBinding.parameters),
    },
  };
}

export function yamlToServiceBinding(yaml) {
  return {
    name: jp.value(yaml, '$.metadata.name') || '',
    namespace: jp.value(yaml, '$.metadata.namespace') || '',
    labels: jp.value(yaml, '$.metadata.labels') || '',
    instanceName: jp.value(yaml, '$.spec.serviceInstanceName') || '',
    externalName: jp.value(yaml, '$.spec.externalName') || '',
    secretName: jp.value(yaml, '$.spec.secretName') || '',
    parameters:
      JSON.stringify(jp.value(yaml, '$.spec.parameters', null, 2) || {}) || '',
  };
}

export function createServiceBindingTemplate(namespaceId) {
  return {
    name: '',
    namespace: namespaceId,
    labels: {},
    instanceName: '',
    externalName: '',
    secretName: '',
    parameters: `{
  
}
    `,
  };
}
