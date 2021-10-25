export function createRoleTemplate(namespace) {
  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'Role',
    metadata: {
      name: '',
      namespace,
    },
    rules: [createRuleTemplate(true)],
  };
}

export function createClusterRoleTemplate() {
  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'ClusterRole',
    metadata: { name: '' },
    rules: [createRuleTemplate(false)],
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
