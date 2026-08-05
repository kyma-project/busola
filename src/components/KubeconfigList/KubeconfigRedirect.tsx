import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import jsyaml from 'js-yaml';
import { clusterAtom } from 'state/clusterAtom';
import { addByContext } from 'components/Clusters/shared';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { ValidKubeconfig } from 'types';

export function KubeconfigRedirect() {
  const { name } = useParams<{ name: string }>();
  const setCluster = useSetAtom(clusterAtom);
  const clusterInfo = useClustersInfo();
  const { t } = useTranslation();

  useEffect(() => {
    if (!name) return;

    fetch(`/backend/kubeconfig/${name}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.text();
      })
      .then((text) => {
        const kubeconfig = jsyaml.load(text) as ValidKubeconfig;
        if (!kubeconfig?.contexts?.length) {
          throw new Error(t('kubeconfig-id.must-be-an-object'));
        }
        setCluster(null);
        const currentContext = kubeconfig['current-context'];
        const context =
          kubeconfig.contexts.find((c) => c.name === currentContext) ??
          kubeconfig.contexts[0];
        addByContext(
          {
            kubeconfig,
            context,
            switchCluster: true,
            storage: 'sessionStorage',
            config: {},
          },
          clusterInfo,
        );
      })
      .catch((e) => {
        console.error('Failed to load kubeconfig:', e);
        clusterInfo.navigate('/clusters');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return null;
}
