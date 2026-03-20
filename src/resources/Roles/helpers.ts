export function unique(arr: any[]) {
  return [...new Set(arr)];
}
export const EMPTY_API_GROUP_KEY = 'core-api-group';
export const extractApiGroupVersion = (groupVersion: string) => {
  if (!groupVersion) return { group: '', version: '' };
  // handle core ('') group
  if (groupVersion === 'v1') return { group: '', version: 'v1' };

  const [apiGroup, apiVersion] = groupVersion.split('/');
  return { group: apiGroup, version: apiVersion };
};

export const getApiGroupInputOptions = (groupVersions: any) =>
  unique(groupVersions?.map(extractApiGroupVersion))?.map(({ group }) =>
    group === ''
      ? { key: EMPTY_API_GROUP_KEY, text: '(core)' }
      : { key: group, text: group },
  ) ?? [];

export function createRoleTemplate(
  namespace: string,
  { name = '', rules }: { name?: string; rules?: any[] } = {},
) {
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

export function createRuleTemplate(isNamespaced?: boolean) {
  return {
    verbs: [],
    apiGroups: [],
    resources: [],
    resourceNames: [],
    ...(isNamespaced ? null : { nonResourceURLs: [] }),
  };
}

export function createRolePresets(
  namespace: string,
  translate: any,
  groupVersions: any[],
) {
  const apiGroups = getApiGroupInputOptions(groupVersions).map((g) =>
    g.key === 'core-api-group' ? '' : g.key,
  );

  return [
    {
      name: translate('roles.templates.all-permissions'),
      value: createRoleTemplate(namespace, {
        name: 'all-permissions',
        rules: [
          {
            verbs: ['*'],
            apiGroups,
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
            apiGroups,
            resources: ['*'],
            resourceNames: [],
          },
        ],
      }),
    },
  ];
}

function isResourceRule(rule: any) {
  return (
    !!rule.apiGroups?.length && !!rule.resources?.length && !!rule.verbs?.length
  );
}

function isNonResourceRule(rule: any) {
  return !!rule.nonResourceURLs?.length && !!rule.verbs?.length;
}

export function hasRuleRequiredProperties(rule: any) {
  if (!rule) return false;

  return isResourceRule(rule) !== isNonResourceRule(rule);
}

export function isRuleInvalid(rule: any) {
  if (!rule) return false;

  return (
    !!rule.nonResourceURLs?.length &&
    (!!rule.apiGroups?.length ||
      !!rule.resources?.length ||
      !!rule.resourceNames?.length)
  );
}

export function validateRole(role: any) {
  return role?.rules?.every(hasRuleRequiredProperties);
}
