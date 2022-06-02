import { mockPostRequest } from '../createMock';

export const clusterDetailsSelfSubjectRules = mockPostRequest(
  '/backend/api/v1/namespaces/default/configmaps',
  {
    kind: 'SelfSubjectRulesReview',
    apiVersion: 'authorization.k8s.io/v1',
    metadata: {
      creationTimestamp: null,
    },
    spec: {},
    status: {
      resourceRules: [
        {
          verbs: ['use'],
          apiGroups: ['policy', 'extensions'],
          resources: ['podsecuritypolicies'],
          resourceNames: ['gardener.privileged'],
        },
        {
          verbs: ['create'],
          apiGroups: ['authorization.k8s.io'],
          resources: ['selfsubjectaccessreviews', 'selfsubjectrulesreviews'],
        },
        {
          verbs: ['use'],
          apiGroups: ['policy'],
          resources: ['podsecuritypolicies'],
          resourceNames: ['001-kyma-unprivileged'],
        },
        {
          verbs: ['use'],
          apiGroups: ['policy', 'extensions'],
          resources: ['podsecuritypolicies'],
          resourceNames: ['gardener.unprivileged'],
        },
        {
          verbs: ['*'],
          apiGroups: ['*'],
          resources: ['*'],
        },
      ],
      nonResourceRules: [
        {
          verbs: ['get'],
          nonResourceURLs: [
            '/healthz',
            '/livez',
            '/readyz',
            '/version',
            '/version/',
          ],
        },
        {
          verbs: ['get'],
          nonResourceURLs: ['/healthz/ready'],
        },
        {
          verbs: ['get'],
          nonResourceURLs: [
            '/api',
            '/api/*',
            '/apis',
            '/apis/*',
            '/healthz',
            '/livez',
            '/openapi',
            '/openapi/*',
            '/readyz',
            '/version',
            '/version/',
          ],
        },
        {
          verbs: ['*'],
          nonResourceURLs: ['*'],
        },
      ],
      incomplete: false,
    },
  },
);
