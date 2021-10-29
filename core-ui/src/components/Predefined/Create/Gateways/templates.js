export function newServer() {
  return {
    port: {
      number: 80,
      name: '',
      protocol: 'HTTP',
    },
    hosts: [],
  };
}

export function createGatewayTemplate(namespace) {
  return {
    apiVersion: 'networking.istio.io/v1alpha3',
    kind: 'Gateway',
    metadata: {
      name: '',
      namespace,
      labels: {
        'app.kubernetes.io/name': '',
      },
    },
    spec: {
      selector: {},
      servers: [newServer()],
    },
  };
}

export function createPresets(namespace, translate) {
  return [
    {
      name: translate('common.labels.default-preset'),
      value: createGatewayTemplate(namespace),
    },
    {
      name: 'ingressgateway',
      value: {
        apiVersion: 'networking.istio.io/v1alpha3',
        kind: 'Gateway',
        metadata: {
          name: 'httpbin-gateway',
          namespace,
          labels: {
            'app.kubernetes.io/name': 'httpbin-gateway',
          },
        },
        spec: {
          selector: {
            istio: 'ingressgateway',
          },
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
              hosts: [],
            },
          ],
        },
      },
    },
  ];
}
