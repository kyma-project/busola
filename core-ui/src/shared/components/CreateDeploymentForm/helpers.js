import * as jp from 'jsonpath';

export function formatService(deployment, deploymentUID) {
  return {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: deployment.name,
      namespace: deployment.namespace,
      ownerReferences: [
        {
          kind: 'Deployment',
          apiVersion: 'apps/v1',
          name: deployment.name,
          uid: deploymentUID,
        },
      ],
    },
    spec: {
      selector: { app: deployment.name },
      type: 'ClusterIP',
      ports: [
        {
          name: 'http',
          port: deployment.serviceData.port.port,
          protocol: 'TCP',
          targetPort: deployment.serviceData.port.targetPort,
        },
      ],
    },
  };
}

export function deploymentToYaml(deployment) {
  if (!deployment.labels.app) {
    deployment.labels.app = deployment.name;
  }

  return {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: deployment.name,
      namespace: deployment.namespace,
      labels: deployment.labels,
    },
    spec: {
      replicas: 1,
      selector: { matchLabels: deployment.labels },
      template: {
        metadata: { labels: deployment.labels },
        spec: {
          containers: [
            {
              name: deployment.name,
              image: deployment.dockerImage,
              resources: {
                requests: deployment.requests,
                limits: deployment.limits,
              },
            },
          ],
        },
      },
    },
  };
}

export function yamlToDeployment(yaml, prevDeployment) {
  return {
    name: jp.value(yaml, '$.metadata.name') || '',
    namespace: jp.value(yaml, '$.metadata.namespace') || '',
    dockerImage:
      jp.value(yaml, '$.spec.template.spec.containers[0].image') || '',
    labels: jp.value(yaml, '$.metadata.labels') || {},
    requests: {
      memory:
        jp.value(
          yaml,
          '$.spec.template.spec.containers[0].resources.requests.memory',
        ) || '64Mi',
      cpu:
        jp.value(
          yaml,
          '$.spec.template.spec.containers[0].resources.requests.cpu',
        ) || '50m',
    },
    limits: {
      memory:
        jp.value(
          yaml,
          '$.spec.template.spec.containers[0].resources.limits.memory',
        ) || '128Mi',
      cpu:
        jp.value(
          yaml,
          '$.spec.template.spec.containers[0].resources.limits.memory',
        ) || '100m',
    },
    serviceData: prevDeployment.serviceData,
  };
}

export function createDeploymentTemplate(namespaceId) {
  return {
    name: '',
    namespace: namespaceId,
    dockerImage: '',
    labels: {},
    requests: {
      memory: '64Mi',
      cpu: '50m',
    },
    limits: {
      memory: '128Mi',
      cpu: '100m',
    },
    serviceData: {
      create: true,
      port: {
        port: 80,
        targetPort: 8080,
      },
    },
  };
}

export function createPresets(namespaceId, translate) {
  return [
    {
      name: translate('deployments.create-modal.presets.default'),
      value: createDeploymentTemplate(namespaceId),
    },
    {
      name: 'Echo server',
      value: {
        name: 'echo-server',
        namespace: namespaceId,
        dockerImage: 'ealen/echo-server',
        labels: { app: 'echo-server' },
        requests: {
          memory: '64Mi',
          cpu: '50m',
        },
        limits: {
          memory: '128Mi',
          cpu: '100m',
        },
        serviceData: {
          create: true,
          port: {
            port: 80,
            targetPort: 3000,
          },
        },
      },
    },
  ];
}
