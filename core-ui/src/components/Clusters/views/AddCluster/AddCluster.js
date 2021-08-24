import React from 'react';
import LuigiClient from '@luigi-project/client';
import './AddCluster.scss';

import {
  PageHeader,
  useNotification,
  useMicrofrontendContext,
} from 'react-shared';
import { useTranslation } from 'react-i18next';
import { AUTH_FORM_TOKEN } from '../../components/AuthForm';
import { KubeconfigUpload } from '../../components/KubeconfigUpload/KubeconfigUpload';
import {
  decompressParams,
  hasKubeconfigAuth,
  getContext,
  addCluster,
} from '../../shared';
import { ClusterConfiguration } from '../../components/ClusterConfiguration';
import { ChooseStorage } from './ChooseStorage';

export function AddCluster() {
  const { busolaClusterParams } = useMicrofrontendContext();
  const [kubeconfig, setKubeconfig] = React.useState(null);
  const [initParams, setInitParams] = React.useState(null);
  const [storage, setStorage] = React.useState(
    busolaClusterParams?.config.defaultStorage || 'localStorage',
  );
  const notification = useNotification();
  const isMounted = React.useRef();

  React.useEffect(() => {
    isMounted.current = true;
    return _ => (isMounted.current = false);
  }, []);

  const encodedParams = LuigiClient.getNodeParams().init;
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!isMounted.current) return; // avoid state updates on onmounted component
    if (!encodedParams || initParams) return;
    async function setKubeconfigIfPresentInParams() {
      const params = await decompressParams(encodedParams);
      setInitParams(params);
      if (Object.keys(params.kubeconfig || {}).length) {
        setKubeconfig(params.kubeconfig);
      }
      notification.notifySuccess(
        {
          title: t('clusters.messages.missing-configuration-data'),
          type: 'info',
          icon: '',
          buttonConfirm: false,
          buttonDismiss: 'Ok',
        },
        7500,
      );
    }
    setKubeconfigIfPresentInParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encodedParams, initParams]);

  function handleKubeconfigAdded(kubeconfig) {
    if (!kubeconfig) {
      setKubeconfig(null);
      return;
    }

    const hasOneContext = kubeconfig.contexts?.length === 1;
    const contextName = kubeconfig.contexts && kubeconfig.contexts[0]?.name;
    const hasAuth = hasKubeconfigAuth(kubeconfig, contextName);

    // skip config
    if (hasOneContext && hasAuth) {
      try {
        addCluster({
          kubeconfig,
          config: { ...initParams?.config, storage },
          currentContext: getContext(kubeconfig, contextName),
        });
      } catch (e) {
        notification.notifyError({
          title: t('clusters.messages.wrong-configuration'),
          content: t('common.tooltips.error') + e.message,
        });
        console.warn(e);
      }
    } else {
      // show additional configuration
      setKubeconfig(kubeconfig);
    }
  }

  return (
    <>
      <PageHeader
        title={t('clusters.add.title')}
        description={t('clusters.messages.upload-paste-kubeconfig')}
        breadcrumbItems={[
          {
            name: 'Clusters',
            path: '/clusters',
            fromAbsolutePath: true,
          },
        ]}
      />
      <section className="add-cluster-form fd-margin-top--lg">
        {!kubeconfig && (
          <>
            <ChooseStorage storage={storage} setStorage={setStorage} />
            <KubeconfigUpload
              handleKubeconfigAdded={handleKubeconfigAdded}
              kubeconfigFromParams={initParams?.kubeconfig}
              storage={storage}
              setStorage={setStorage}
            />
          </>
        )}
        {kubeconfig && (
          <ClusterConfiguration
            kubeconfig={kubeconfig}
            auth={{ type: AUTH_FORM_TOKEN }}
            initParams={initParams}
            storage={storage}
            goBack={() => setKubeconfig(false)}
          />
        )}
      </section>
    </>
  );
}
