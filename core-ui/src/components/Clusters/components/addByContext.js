import { addCluster, getContext } from 'components/Clusters/shared';

export const addByContext = (
  kubeconfig,
  context,
  switchCluster = true,
  storage = 'sessionStorage',
  config,
) => {
  const cluster = kubeconfig.clusters.find(
    c => c.name === context.context.cluster,
  );
  const user = kubeconfig.users.find(u => u.name === context.context.user);
  const newKubeconfig = {
    ...kubeconfig,
    'current-context': context.name,
    contexts: [context],
    clusters: [cluster],
    users: [user],
  };
  addCluster(
    {
      kubeconfig: newKubeconfig,
      contextName: context.name,
      config: { ...(config || {}), storage },
      currentContext: getContext(newKubeconfig, context.name),
    },
    switchCluster,
  );
};
