import React from 'react';
import LuigiClient from '@luigi-project/client';
import './AddCluster.scss';

import { PageHeader, useNotification } from 'react-shared';
import {
  AUTH_FORM_TOKEN,
  AUTH_FORM_OIDC,
} from 'components/Clusters/components/AuthForm';
import { KubeconfigUpload } from 'components/Clusters/components/KubeconfigUpload/KubeconfigUpload';
import { decompressParams } from 'components/Clusters/shared';
import { ConfigurationDetails } from '../../components/ConfigurationDetails';

export function AddCluster() {
  const [kubeconfig, setKubeconfig] = React.useState(null);
  const [initParams, setInitParams] = React.useState(null);
  const notification = useNotification();

  const encodedParams = LuigiClient.getNodeParams().init;

  React.useEffect(() => {
    if (!encodedParams) return;
    async function setKubeconfigIfPresentInParams() {
      const params = await decompressParams(encodedParams);
      setInitParams(params);
      if (Object.keys(params.kubeconfig || {}).length) {
        setKubeconfig(params.kubeconfig);
      }
      notification.notify({
        title:
          'Configuration has been included properly. Please fill remaining required data.',
        type: 'info',
        icon: '',
        autoClose: true,
      });
    }
    setKubeconfigIfPresentInParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encodedParams]);

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
            handleKubeconfigAdded={setKubeconfig}
            kubeconfigFromParams={initParams?.kubeconfig}
          />
        )}
        {kubeconfig && (
          <ConfigurationDetails
            kubeconfig={kubeconfig}
            auth={
              initParams?.config?.auth
                ? {
                    type: AUTH_FORM_OIDC,
                    ...initParams.config.auth,
                  }
                : { type: AUTH_FORM_TOKEN }
            }
            initParams={initParams}
            goBack={() => setKubeconfig(false)}
          />
        )}
      </section>
    </>
  );
}
