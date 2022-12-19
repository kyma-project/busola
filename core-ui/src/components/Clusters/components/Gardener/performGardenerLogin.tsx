import jsyaml from 'js-yaml';
import { base64Decode } from 'shared/helpers';
import { addCluster } from 'components/Clusters/shared';
import { ValidKubeconfig } from 'types';
import { PermissionSet } from 'state/permissionSetsSelector';
import { useClustersInfoType } from 'state/utils/getClustersInfo';
import { ActiveClusterState } from 'state/clusterAtom';

export async function performGardenerLogin(
  kubeconfigText: string,
  setReport: (report: string) => void,
  backendAddress: string,
  clustersInfo: useClustersInfoType,
) {
  setReport('Performing SSR...');
  const kubeconfig = jsyaml.load(kubeconfigText) as ValidKubeconfig;

  const clusterUrl = kubeconfig.clusters[0].cluster.server;
  const authorization = `Bearer ${
    (kubeconfig.users[0].user as { token: string }).token
  }`;

  const ssrr = {
    typeMeta: {
      kind: 'SelfSubjectRulesReview',
      aPIVersion: 'authorization.k8s.io/v1',
    },
    spec: { namespace: '*' },
  };

  const ssrUrl = `${backendAddress}/apis/authorization.k8s.io/v1/selfsubjectrulesreviews`;
  const ssrResponse = await fetch(ssrUrl, {
    method: 'POST',
    body: JSON.stringify(ssrr),
    headers: {
      'Content-Type': 'application/json',
      'X-Cluster-Url': clusterUrl,
      'X-K8s-Authorization': authorization,
    },
  });
  const ssrResult = await ssrResponse.json();
  console.log('CLUSTERWIDE RESOURCE RULES', ssrResult.status.resourceRules);
  const availableProjects = [
    ...new Set(
      (ssrResult.status.resourceRules as PermissionSet[])
        .filter(
          r =>
            r.apiGroups.includes('core.gardener.cloud') &&
            r.resources.includes('projects') &&
            r.resourceNames,
        )
        .flatMap(r => r.resourceNames),
    ),
  ];
  console.log('AVAILABLE PROJECTS', availableProjects);

  const kubeconfigs: ValidKubeconfig[] = [];

  for (const project of availableProjects) {
    setReport('Fetching shoots in ' + project);
    const url = `${backendAddress}/apis/core.gardener.cloud/v1beta1/namespaces/garden-${project}/shoots`;
    const shootsResponse = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cluster-Url': clusterUrl,
        'X-K8s-Authorization': authorization,
      },
    });
    const shoots = await shootsResponse.json();
    console.log('SHOOTS IN ', project, shoots.items);

    for (const [index, shoot] of shoots.items.entries()) {
      setReport(
        'Fetching shoots in ' +
          project +
          ' (' +
          (index + 1) +
          ' / ' +
          shoots.items.length +
          ')',
      );
      const payload = {
        apiVersion: 'authentication.gardener.cloud/v1alpha1',
        kind: 'AdminKubeconfigRequest',
        spec: {
          expirationSeconds: 60 * 60,
        },
      };

      const kubeconfigUrl = `${backendAddress}/apis/core.gardener.cloud/v1beta1/namespaces/garden-${project}/shoots/${shoot.metadata.name}/adminkubeconfig`;
      const kubeconfigResponse = await fetch(kubeconfigUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          'X-Cluster-Url': clusterUrl,
          'X-K8s-Authorization': authorization,
        },
      });
      const res = await kubeconfigResponse.json();
      kubeconfigs.push(
        jsyaml.load(base64Decode(res.status.kubeconfig)) as ValidKubeconfig,
      );
    }
  }

  kubeconfigs.forEach(kubeconfig => {
    const contextName = kubeconfig['current-context'];
    const context =
      kubeconfig.contexts?.find(ctx => ctx.name === contextName) ||
      kubeconfig.contexts?.[0];
    const currentContext = {
      cluster: kubeconfig.clusters.find(
        c => c.name === context.context.cluster,
      )!,
      user: kubeconfig.users.find(u => u.name === context.context.user)!,
    };

    const cluster: NonNullable<ActiveClusterState> = {
      name: contextName,
      contextName,
      currentContext,
      kubeconfig,
      config: null,
    };

    addCluster(cluster, clustersInfo);
  });

  setReport('Clusters added!');
}
