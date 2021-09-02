import * as jp from 'jsonpath';
import shortid from 'shortid';

export const TSL_MODE = [
  'PASSTHROUGH',
  'SIMPLE',
  'MUTUAL',
  'AUTO_PASSTHROUGH',
  'ISTIO_MUTUAL',
];

export function newServer() {
  return {
    id: shortid.generate(),
    port: {
      number: 5,
      name: '',
      protocol: '',
    },
    tls: {
      mode: '',
      credentialName: '',
    },
    hosts: '',
  };
}

export function gatewayToYaml(gateway) {
  return {
    apiVersion: 'networking.istio.io/v1alpha3',
    kind: 'Gateway',
    metadata: {
      name: gateway.name,
      namespace: gateway.namespace,
      labels: gateway.labels,
    },
    spec: {
      selector: gateway.selector,
      servers: gateway.servers,
    },
  };
}

export function yamlToGateway(yaml, prevGateway) {
  return {
    name: jp.value(yaml, '$.metadata.name') || '',
    namespace: jp.value(yaml, '$.metadata.namespace') || '',
    selector: jp.value(yaml, '$.spec.selector') || {},
    labels: jp.value(yaml, '$.metadata.labels') || {},
  };
}

export function createGatewayTemplate(namespaceId) {
  return {
    name: '',
    namespace: namespaceId,
    selector: {},
    labels: {},
    servers: [newServer()],
  };
}

export function createPresets(namespaceId, translate) {
  return [
    {
      name: translate('gateways.create-modal.presets.default'),
      value: createGatewayTemplate(namespaceId),
    },
    {
      name: 'ingressgateway',
      value: {
        name: 'httpbin-gateway',
        namespace: namespaceId,
        selector: {
          istio: 'ingressgateway',
        },
        labels: {},
        servers: [
          {
            port: {
              number: 443,
              name: 'https',
              protocol: 'HTTPS',
            },
            tls: {
              mode: 'SIMPLE',
              credentialName: '',
            },
            hosts: '',
          },
        ],
      },
    },
  ];
}
