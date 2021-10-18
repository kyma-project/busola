export function createRoleTemplate(namespace) {
  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'Role',
    metadata: {
      name: '',
      namespace,
    },
    rules: [],
  };
}

export function createClusterRoleTemplate() {
  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'ClusterRole',
    metadata: { name: '' },
    rules: [],
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

export function validateRole(role) {
  return role?.rules?.every(
    rule =>
      rule?.apiGroups?.length && rule?.resources?.length && rule?.verbs?.length,
  );
}
