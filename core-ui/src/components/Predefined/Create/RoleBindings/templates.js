const GROUP_SUBJECT = {
  kind: 'Group',
  name: '',
  apiGroup: '',
};
const SERVICE_ACCOUNT_SUBJECT = {
  kind: 'ServiceAccount',
  name: '',
  apiGroup: '',
};
const USER_SUBJECT = {
  kind: 'User',
  name: '',
  apiGroup: '',
};

export function newSubject() {
  return USER_SUBJECT;
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
