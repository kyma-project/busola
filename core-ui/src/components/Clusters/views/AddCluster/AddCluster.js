import React from 'react';
import LuigiClient from '@luigi-project/client';
import './AddCluster.scss';

import { PageHeader } from 'react-shared';
import { AuthForm } from 'components/Clusters/components/AuthForm';
import { KubeconfigUpload } from 'components/Clusters/components/KubeconfigUpload/KubeconfigUpload';
import { ContextChooser } from 'components/Clusters/components/ContextChooser/ContextChooser';
import {
  getContext,
  hasKubeconfigAuth,
  addCluster,
  decompressParams,
} from 'components/Clusters/shared';
import { Button } from 'fundamental-react';

export function AddCluster() {
  const [kubeconfig, setKubeconfig] = React.useState(null);
  const [contextName, setContextName] = React.useState(null);
  const [initParams, setInitParams] = React.useState(null);
  const [auth, setAuth] = React.useState({});
  const [authValid, setAuthValid] = React.useState(false);

  const requireAuth = kubeconfig && !hasKubeconfigAuth(kubeconfig, contextName);

  const encodedParams = LuigiClient.getNodeParams().init;
  React.useEffect(() => {
    if (!encodedParams) return;
    async function setKubeconfigIfPresentInParams() {
      const params = await decompressParams(encodedParams);
      setInitParams(params);
      if (params.config.auth) {
        setAuth(params.config.auth);
      }
      if (Object.keys(params.kubeconfig || {}).length) {
        handleKubeconfigAdded(params.kubeconfig);
      }
    }
    setKubeconfigIfPresentInParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encodedParams]);

  const handleKubeconfigAdded = async kubeconfig => {
    setContextName(kubeconfig['current-context']);
    setKubeconfig(kubeconfig);
  };

  const onApply = () => {
    // update original kk's choosen context
    kubeconfig['current-context'] = contextName;

    addCluster({
      kubeconfig,
      config: { ...initParams?.config, auth: requireAuth ? auth : null },
      currentContext: getContext(kubeconfig, contextName),
    });
  };

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
        {initParams && (
          <p>
            Configuration has been included properly. Please fill remaining
            required data.
          </p>
        )}
        <KubeconfigUpload
          onTabChange={() => setKubeconfig(null)}
          handleKubeconfigAdded={handleKubeconfigAdded}
          kubeconfigFromParams={initParams?.kubeconfig}
        />
        {kubeconfig && (
          <ContextChooser
            kubeconfig={kubeconfig}
            setContextName={setContextName}
          />
        )}
        {requireAuth && (
          <AuthForm auth={auth} setAuth={setAuth} setAuthValid={setAuthValid} />
        )}
        <Button
          option="emphasized"
          className="fd-margin-top--sm"
          onClick={onApply}
          disabled={!kubeconfig || (requireAuth && !authValid)}
        >
          Apply configuration
        </Button>
      </section>
    </>
  );
}
