import jsyaml from 'js-yaml';
import { base64Decode } from 'shared/helpers';
import { addCluster } from 'components/Clusters/shared';
import { K8sResource, ValidKubeconfig } from 'types';
import { PermissionSet } from 'state/permissionSetsSelector';
import { ActiveClusterState } from 'state/clusterAtom';
import { getClusterConfig } from 'state/utils/getBackendInfo';
import { useClustersInfo } from 'state/utils/getClustersInfo';

async function failFastFetch<T>(
  url: string,
  init: RequestInit | undefined,
): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response.json() as T;
}

export function useGardenerLogin(setReport: (report: string) => void) {
  const { backendAddress } = getClusterConfig();
  const clustersInfo = useClustersInfo();

  const getAvailableProjects = async (
    fetchHeaders: HeadersInit,
  ): Promise<string[]> => {
    type SSRResult = {
      status: { resourceRules: PermissionSet[] };
    };
    const ssrr = {
      typeMeta: {
        kind: 'SelfSubjectRulesReview',
        aPIVersion: 'authorization.k8s.io/v1',
      },
      spec: { namespace: '*' },
    };

    const ssrUrl = `${backendAddress}/apis/authorization.k8s.io/v1/selfsubjectrulesreviews`;
    setReport('Performing SSR...');
    const ssrResult = await failFastFetch<SSRResult>(ssrUrl, {
      method: 'POST',
      body: JSON.stringify(ssrr),
      headers: fetchHeaders,
    });
    return [
      ...new Set(
        ssrResult.status.resourceRules
          .filter(
            r =>
              r.apiGroups.includes('core.gardener.cloud') &&
              r.resources.includes('projects') &&
              r.resourceNames,
          )
          .flatMap(r => r.resourceNames),
      ),
    ] as [];
  };

  const getKubeconfigs = async (
    fetchHeaders: HeadersInit,
    availableProjects: string[],
  ) => {
    type ShootsResult = {
      items: K8sResource[];
    };

    type KubeconfigResult = {
      status: { kubeconfig: string };
    };

    const kubeconfigs: ValidKubeconfig[] = [];

    for (const project of availableProjects) {
      setReport('Fetching shoots in ' + project);
      const url = `${backendAddress}/apis/core.gardener.cloud/v1beta1/namespaces/garden-${project}/shoots`;
      const shoots = await failFastFetch<ShootsResult>(url, {
        headers: fetchHeaders,
      });

      for (const [index, shoot] of shoots.items.entries()) {
        setReport(
          `Fetching shoots in ${project} (${index + 1} / ${
            shoots.items.length
          })`,
        );
        const payload = {
          apiVersion: 'authentication.gardener.cloud/v1alpha1',
          kind: 'AdminKubeconfigRequest',
          spec: { expirationSeconds: 3 * 60 * 60 }, // 3h
        };

        const kubeconfigUrl = `${backendAddress}/apis/core.gardener.cloud/v1beta1/namespaces/garden-${project}/shoots/${shoot.metadata.name}/adminkubeconfig`;
        const res = await failFastFetch<KubeconfigResult>(kubeconfigUrl, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: fetchHeaders,
        });
        kubeconfigs.push(
          jsyaml.load(base64Decode(res.status.kubeconfig)) as ValidKubeconfig,
        );
      }
    }
    return kubeconfigs;
  };

  const addKubeconfig = (kubeconfig: ValidKubeconfig) => {
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
      config: { storage: 'sessionStorage' },
    };

    addCluster(cluster, clustersInfo, false);
  };

  return async (serverAddress: string, token: string) => {
    const fetchHeaders = {
      'Content-Type': 'application/json',
      'X-Cluster-Url': serverAddress,
      'X-K8s-Authorization': `Bearer ${token}`,
    };

    const availableProjects = await getAvailableProjects(fetchHeaders);
    const kubeconfigs = await getKubeconfigs(fetchHeaders, availableProjects);
    kubeconfigs.forEach(addKubeconfig);
  };
}
