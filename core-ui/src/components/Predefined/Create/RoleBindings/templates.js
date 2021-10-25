export const SUBJECT_KINDS = ['Group', 'ServiceAccount', 'User'];
export const DEFAULT_APIGROUP = 'rbac.authorization.k8s.io';
const GROUP_SUBJECT = {
  kind: 'Group',
  name: '',
  apiGroup: DEFAULT_APIGROUP,
};
const SERVICE_ACCOUNT_SUBJECT = {
  kind: 'ServiceAccount',
  name: '',
  namespace: '',
};
const USER_SUBJECT = {
  kind: 'User',
  name: '',
  apiGroup: DEFAULT_APIGROUP,
};

export function newSubject(kind) {
  console.log('add newSubject', kind);
  switch (kind) {
    case 'Group':
      console.log('case Group');
      return GROUP_SUBJECT;
    case 'ServiceAccount':
      console.log('case ServiceAccount');
      return SERVICE_ACCOUNT_SUBJECT;
    case 'User':
    default:
      console.log('case default and user');
      return USER_SUBJECT;
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
