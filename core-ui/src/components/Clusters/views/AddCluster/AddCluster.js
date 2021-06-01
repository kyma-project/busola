import React from 'react';
import LuigiClient from '@luigi-project/client';
import './AddCluster.scss';

import { PageHeader } from 'react-shared';
import {
  AuthForm,
  AUTH_FORM_TOKEN,
  AUTH_FORM_OIDC,
} from 'components/Clusters/components/AuthForm';
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
  const [auth, setAuth] = React.useState({ type: AUTH_FORM_TOKEN });
  const [authValid, setAuthValid] = React.useState(false);

  const requireAuth = kubeconfig && !hasKubeconfigAuth(kubeconfig, contextName);

  const encodedParams = LuigiClient.getNodeParams().init;

  React.useEffect(() => {
    if (!encodedParams) return;
    async function setKubeconfigIfPresentInParams() {
      const params = await decompressParams(encodedParams);
      setInitParams(params);
      if (params.config.auth) {
        setAuth({
          type: AUTH_FORM_OIDC,
          ...params.config.auth,
        });
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

    const config = { ...initParams?.config };

    const params = {
      kubeconfig,
      config,
      currentContext: getContext(kubeconfig, contextName),
    };

    if (requireAuth) {
      const { type: authType, token, ...oidcProps } = auth;
      if (authType === AUTH_FORM_OIDC) {
        // just add OIDC params to configuration
        params.config.auth = oidcProps;
      } else {
        // add token to current context's user
        const { context } = kubeconfig.contexts.find(
          c => c.name === contextName,
        );
        params.kubeconfig.users.find(
          u => u.name === context.user,
        ).user.token = token;
      }
    }

    addCluster(params);
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
