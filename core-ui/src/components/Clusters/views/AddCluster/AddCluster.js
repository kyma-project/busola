import React from 'react';
import LuigiClient from '@luigi-project/client';
import './AddCluster.scss';

import { PageHeader, useNotification } from 'react-shared';
import { AUTH_FORM_TOKEN } from '../../components/AuthForm';
import { KubeconfigUpload } from '../../components/KubeconfigUpload/KubeconfigUpload';
import {
  decompressParams,
  hasKubeconfigAuth,
  getContext,
  addCluster,
} from '../../shared';
import { ClusterConfiguration } from '../../components/ClusterConfiguration';

export function AddCluster() {
  const [kubeconfig, setKubeconfig] = React.useState(null);
  const [initParams, setInitParams] = React.useState(null);
  const notification = useNotification();
  const isMounted = React.useRef();

  React.useEffect(() => {
    isMounted.current = true;
    return _ => (isMounted.current = false);
  }, []);

  const encodedParams = LuigiClient.getNodeParams().init;

  React.useEffect(() => {
    if (!isMounted.current) return; // avoid state updates on onmounted component
    if (!encodedParams || initParams) return;
    async function setKubeconfigIfPresentInParams() {
      const params = await decompressParams(encodedParams);
      setInitParams(params);
      if (Object.keys(params.kubeconfig || {}).length) {
        setKubeconfig(params.kubeconfig);
      }
      notification.notify(
        {
          title:
            'Configuration has been included properly. Please fill remaining required data.',
          type: 'info',
          icon: '',
          autoClose: true,
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
          config: { ...initParams?.config },
          currentContext: getContext(kubeconfig, contextName),
        });
      } catch (e) {
        notification.notifyError({
          title: 'Cannot apply configuration',
          content: 'Error: ' + e.message,
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
        title="Add Cluster"
        description="Upload or paste your kubeconfig file"
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
          <KubeconfigUpload
            handleKubeconfigAdded={handleKubeconfigAdded}
            kubeconfigFromParams={initParams?.kubeconfig}
          />
        )}
        {kubeconfig && (
          <ClusterConfiguration
            kubeconfig={kubeconfig}
            auth={{ type: AUTH_FORM_TOKEN }}
            initParams={initParams}
            goBack={() => setKubeconfig(false)}
          />
        )}
      </section>
    </>
  );
}
