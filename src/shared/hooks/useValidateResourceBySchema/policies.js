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
    { $ref: '#/PodSecurityStandardsBaseline' },
    // Volume Types
    'K8S_POD_SEC_ALLOWED_VOLUME_TYPES',
    // Privilege Escalation
    'K8S_POD_SEC_PRIVILEGE_ESCALATION', // CONTAINERS_MISSING_KEY_ALLOWPRIVILEGEESCALATION checks only for containers, not for initContainers and ephemeralContainers
    // Running as Non-root
    '', // CONTAINERS_INCORRECT_RUNASNONROOT_VALUE checks only for containers, not for initContainers and ephemeralContainers
  ],
};
