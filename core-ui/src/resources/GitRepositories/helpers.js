import { randomNameGenerator } from 'shared/utils/helpers';

export function createRepositoryTemplate(namespace) {
  const name = randomNameGenerator();
  return {
    apiVersion: 'serverless.kyma-project.io/v1alpha1',
    kind: 'GitRepository',
    metadata: {
      name,
      namespace,
      labels: {
        'app.kubernetes.io/name': name,
      },
    },
    spec: {},
  };
}
