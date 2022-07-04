export const SUBJECT_KINDS = ['Group', 'ServiceAccount', 'User'];
export const DEFAULT_APIGROUP = 'rbac.authorization.k8s.io';

export function newSubject(kind) {
  switch (kind) {
    case 'Group':
      return {
        kind: 'Group',
        name: '',
        apiGroup: DEFAULT_APIGROUP,
      };
    case 'ServiceAccount':
      return {
        kind: 'ServiceAccount',
        name: '',
        namespace: '',
      };
    case 'User':
    default:
      return {
        kind: 'User',
        name: '',
        apiGroup: DEFAULT_APIGROUP,
      };
  }
}

export function createBindingTemplate(namespace) {
  return namespace
    ? createNamespacedBindingTemplate(namespace)
    : createClusterBindingTemplate();
}

function createNamespacedBindingTemplate(namespace) {
  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name: '',
      namespace,
    },
    subjects: [newSubject()],
  };
}
function createClusterBindingTemplate() {
  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'ClusterRoleBinding',
    metadata: {
      name: '',
    },
    subjects: [newSubject()],
  };
}
