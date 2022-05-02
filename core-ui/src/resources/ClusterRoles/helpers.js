import {
  createRuleTemplate,
  getApiGroupInputOptions,
} from 'resources/Roles/helpers';

export function createClusterRoleTemplate({ name = '', rules } = {}) {
  if (!rules) {
    rules = [createRuleTemplate(false)];
  }
  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'ClusterRole',
    metadata: { name },
    rules,
  };
}

export function createClusterRolePresets(translate, groupVersions) {
  const apiGroups = getApiGroupInputOptions(groupVersions).map(g => g.key);
  return [
    {
      name: translate('common.labels.default-preset'),
      value: createClusterRoleTemplate(),
    },
    {
      name: translate('roles.templates.all-permissions'),
      value: createClusterRoleTemplate({
        name: 'all-permissions',
        rules: [
          {
            verbs: ['*'],
            apiGroups,
            resources: ['*'],
            resourceNames: [],
            nonResourceURLs: [],
          },
        ],
      }),
    },
    {
      name: translate('roles.templates.view-only'),
      value: createClusterRoleTemplate({
        name: 'view-only',
        rules: [
          {
            verbs: ['get', 'list', 'watch'],
            apiGroups,
            resources: ['*'],
            resourceNames: [],
            nonResourceURLs: [],
          },
        ],
      }),
    },
  ];
}
