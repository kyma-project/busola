const resolvePath = (path, obj) => {
  const parts = path.split('/');
  let current = obj;

  parts.forEach(part => {
    if (part !== '#') {
      current = current[part];
    }
  });
  return current;
};

export const getPolicy = name => {
  return policies[name].map(rule => {
    if (rule.$ref) {
      return resolvePath(rule.$ref, policies);
    }
    return rule;
  });
};

export const policies = {
  PodSecurityStandardsBaseline: [
    // Rules for the Kubernetes Pod Security Standards Baseline
    // https://kubernetes.io/docs/concepts/security/pod-security-standards/#baseline

    // HostProcess
    'EKS_INVALID_HOSTPROCESS_VALUE',
    // Host Namespaces
    'CONTAINERS_INCORRECT_HOSTNETWORK_VALUE_TRUE',
    'CONTAINERS_INCORRECT_HOSTPID_VALUE_TRUE',
    'CONTAINERS_INCORRECT_HOSTIPC_VALUE_TRUE',
    // Privileged Containers
    'CONTAINERS_INCORRECT_PRIVILEGED_VALUE_TRUE',
    // Capabilities
    'EKS_INVALID_CAPABILITIES_EKS',
    // HostPath Volumes
    'CONTAINERS_INCORRECT_KEY_HOSTPATH',
    // Host Ports
    'CONTAINERS_INCORRECT_KEY_HOSTPORT',
    // AppArmor
    'K8S_POD_SEC_APPARMOR',
    // SELinux
    'EKS_INVALID_SELINUXOPTIONS_TYPE_VALUE',
    'EKS_INVALID_SELINUXOPTIONS_USER_VALUE',
    'EKS_INVALID_SELINUXOPTIONS_ROLE_VALUE',
    // /proc Mount Type
    'K8S_POD_SEC_PROC_MOUNT',
    // Seccomp
    'K8S_POD_SEC_SECCOMP_PROFILE',
    // Sysctls
    'K8S_POD_SEC_SYSCTLS',
  ],
  PodSecurityStandardsRestricted: [
    // Rules for the Kubernetes Pod Security Standards Restricted
    // https://kubernetes.io/docs/concepts/security/pod-security-standards/#restricted

    { $ref: '#/PodSecurityStandardsBaseline' },
    // Volume Types
    'K8S_POD_SEC_ALLOWED_VOLUME_TYPES',
    // Privilege Escalation (or v1.25+ for linux only)
    'K8S_POD_SEC_PRIVILEGE_ESCALATION', // CONTAINERS_MISSING_KEY_ALLOWPRIVILEGEESCALATION checks only for containers, not for initContainers and ephemeralContainers
    // Running as Non-root
    'K8S_POD_SEC_RUNNING_AS_NON_ROOT', // CONTAINERS_INCORRECT_RUNASNONROOT_VALUE checks only for containers, not for initContainers and ephemeralContainers
    // Running as Non-root user (v1.23+)
    'K8S_POD_SEC_RUNNING_AS_NON_ROOT_USER', // CONTAINERS_INCORRECT_RUNASUSER_VALUE_LOWUID also checks this partly, but only inside the container spec
    // Seccomp (v1.19+) (or v1.25+ for linux only)
    'K8S_POD_SEC_SECCOMP_PROFILE_REQUIRED',
    // Capabilities (v1.22) (or v1.25+ for linux only)
    'K8S_POD_SEC_DROP_ALL_CAPABILITIES',
    'K8S_POD_SEC_CAPABILITIES_ADD_ONLY_NET_BIND_SERVICE',
  ],
};
