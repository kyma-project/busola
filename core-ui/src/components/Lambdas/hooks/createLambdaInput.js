import { getDefaultDependencies } from 'components/Lambdas/helpers/runtime';
import { CONFIG } from 'components/Lambdas/config.js';

export function createLambdaInput(name, namespace, params) {
  const { labels, runtime, ...rest } = params;

  const defaultInlineSpec = {
    source: CONFIG.defaultLambdaCodeAndDeps[runtime].code,
    deps: getDefaultDependencies(name, runtime),
  };
  const spec = rest.source ? rest : defaultInlineSpec;

  return {
    apiVersion: 'serverless.kyma-project.io/v1alpha1',
    kind: 'Function',
    metadata: {
      name,
      namespace,
      labels,
    },
    spec: {
      maxReplicas: 1,
      minReplicas: 1,
      runtime,
      ...spec,
    },
  };
}
