export const EMPTY_TEXT_PLACEHOLDER = '-';

export type ResourceTypeWithAliases = {
  resourceType: string;
  aliases: string[];
};

export const namespaceNativeResourceTypes: ResourceTypeWithAliases[] = [
  { resourceType: 'cronjobs', aliases: ['cj', 'cronjob', 'cronjobs'] },
  { resourceType: 'daemonsets', aliases: ['daemonset', 'daemonsets', 'ds'] },
  {
    resourceType: 'deployments',
    aliases: ['deploy', 'deployment', 'deployments', 'dp'],
  },
  { resourceType: 'configmaps', aliases: ['cm', 'configmap', 'configmaps'] },
  {
    resourceType: 'horizontalpodautoscalers',
    aliases: ['horizontalpodautoscaler', 'horizontalpodautoscalers', 'hpa'],
  },
  { resourceType: 'jobs', aliases: ['jo', 'job', 'jobs'] },
  { resourceType: 'ingresses', aliases: ['ing', 'ingress', 'ingresses'] },
  { resourceType: 'pods', aliases: ['po', 'pod', 'pods'] },
  {
    resourceType: 'limitranges',
    aliases: ['limitrange', 'limitranges', 'limits'],
  },
  {
    resourceType: 'resourcequotas',
    aliases: ['quota', 'resourcequota', 'resourcequotas'],
  },
  {
    resourceType: 'rolebindings',
    aliases: ['rb', 'rolebinding', 'rolebindings'],
  },
  { resourceType: 'roles', aliases: ['ro', 'role', 'roles'] },
  { resourceType: 'secrets', aliases: ['sec', 'secret', 'secrets'] },
  {
    resourceType: 'persistentvolumeclaims',
    aliases: ['persistentvolumeclaim', 'persistentvolumeclaims', 'pvc'],
  },
  { resourceType: 'services', aliases: ['service', 'services', 'svc'] },
  {
    resourceType: 'statefulsets',
    aliases: ['statefulset', 'statefulsets', 'sts'],
  },
  {
    resourceType: 'networkpolicies',
    aliases: ['netpol', 'networkpolicies', 'networkpolicy', 'np'],
  },
  { resourceType: 'serviceaccounts', aliases: ['sa', 'serviceaccount'] },
  { resourceType: 'replicasets', aliases: ['replicaset', 'replicasets', 'rs'] },
  // we don't have nodes for those resources, but let's keep them here
  {
    resourceType: 'replicationcontrollers',
    aliases: ['rc', 'replicationcontroller', 'replicationcontrollers'],
  },
  { resourceType: 'podtemplates', aliases: ['podtemplate', 'podtemplates'] },
  {
    resourceType: 'podsecuritypolicies',
    aliases: ['podsecuritypolicies', 'podsecuritypolicy', 'psp'],
  },
  {
    resourceType: 'poddisruptionbudgets',
    aliases: ['pdb', 'poddisruptionbudget', 'poddisruptionbudgets'],
  },
  { resourceType: 'leases', aliases: ['lease', 'leases'] },
  { resourceType: 'endpoints', aliases: ['endpoints', 'ep'] },
  {
    resourceType: 'csistoragecapacities',
    aliases: ['csistoragecapacities', 'csistoragecapacity'],
  },
  {
    resourceType: 'controllerrevisions',
    aliases: ['controllerrevision', 'controllerrevisions'],
  },
];

export const clusterNativeResourceTypes: ResourceTypeWithAliases[] = [
  {
    resourceType: 'clusterrolebindings',
    aliases: ['clusterrolebinding', 'clusterrolebindings', 'crb'],
  },
  {
    resourceType: 'clusterroles',
    aliases: ['clusterrole', 'clusterroles', 'cr'],
  },
  {
    resourceType: 'persistentvolumes',
    aliases: ['persistentvolume', 'persistentvolumes', 'pv'],
  },
  { resourceType: 'namespaces', aliases: ['namespace', 'namespaces', 'ns'] },
  {
    resourceType: 'storageclasses',
    aliases: ['sc', 'storageclass', 'storageclasses'],
  },
  // we don't have nodes for those resources, but let's keep them here
  {
    resourceType: 'volumeattachments',
    aliases: ['volumeattachment', 'volumeattachments'],
  },
  {
    resourceType: 'validatingwebhookconfigurations',
    aliases: ['validatingwebhookconfiguration'],
  },
  {
    resourceType: 'runtimeclasses',
    aliases: ['runtimeclass', 'runtimeclasses'],
  },
  {
    resourceType: 'prioritylevelconfigurations',
    aliases: ['prioritylevelconfiguration', 'prioritylevelconfigurations'],
  },
  {
    resourceType: 'priorityclasses',
    aliases: ['pc', 'priorityclass', 'priorityclasses'],
  },
  {
    resourceType: 'ingressclasses',
    aliases: ['ingressclass', 'ingressclasses'],
  },
  { resourceType: 'flowschemas', aliases: ['flowschema', 'flowschemas'] },
  { resourceType: 'csidrivers', aliases: ['csidriver', 'csidrivers'] },
  { resourceType: 'csinodes', aliases: ['csinode', 'csinodes'] },
  {
    resourceType: 'certificatesigningrequests',
    aliases: ['certificatesigningrequest', 'certificatesigningrequests', 'csr'],
  },
  { resourceType: 'apiservices', aliases: ['apiservice', 'apiservices'] },
  {
    resourceType: 'mutatingwebhookconfigurations',
    aliases: ['mutatingwebhookconfiguration', 'mutatingwebhookconfigurations'],
  },
];
