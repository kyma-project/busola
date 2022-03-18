export function createRoleTemplate(namespace, { name = '', rules } = {}) {
  if (!rules) {
    rules = [createRuleTemplate(true)];
  }
  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'Role',
    metadata: {
      name,
      namespace,
    },
    rules,
  };
}

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

export function createRuleTemplate(isNamespaced) {
  return {
    verbs: [],
    apiGroups: [],
    resources: [],
    resourceNames: [],
    ...(isNamespaced ? { nonResourceURLs: [] } : null),
  };
}

export function createRolePresets(namespace, translate) {
  return [
    {
      name: translate('roles.templates.all-permissions'),
      value: createRoleTemplate(namespace, {
        name: 'all-permissions',
        rules: [
          {
            verbs: ['*'],
            apiGroups: ['*'],
            resources: ['*'],
            resourceNames: [],
          },
        ],
      }),
    },
    {
      name: translate('roles.templates.view-only'),
      value: createRoleTemplate(namespace, {
        name: 'view-only',
        rules: [
          {
            verbs: ['get', 'list', 'watch'],
            apiGroups: ['*'],
            resources: ['*'],
            resourceNames: [],
          },
        ],
      }),
    },
  ];
}

export function createClusterRolePresets(translate) {
  return [
    {
      name: translate('roles.templates.all-permissions'),
      value: createClusterRoleTemplate({
        name: 'all-permissions',
        rules: [
          {
            verbs: ['*'],
            apiGroups: ['*'],
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
            apiGroups: ['*'],
            resources: ['*'],
            resourceNames: [],
            nonResourceURLs: [],
          },
        ],
      }),
    },
  ];
}

function isResourceRule(rule) {
  return (
    !!rule.apiGroups?.length && !!rule.resources?.length && !!rule.verbs?.length
  );
}

function isNonResourceRule(rule) {
  return !!rule.nonResourceURLs?.length && !!rule.verbs?.length;
}

export function hasRuleRequiredProperties(rule) {
  if (!rule) return false;

  return isResourceRule(rule) ^ isNonResourceRule(rule);
}

export function isRuleInvalid(rule) {
  if (!rule) return false;

  return (
    !!rule.nonResourceURLs?.length &&
    (!!rule.apiGroups?.length ||
      !!rule.resources?.length ||
      !!rule.resourceNames?.length)
  );
}

export function validateRole(role) {
  return role?.rules?.every(hasRuleRequiredProperties);
}
