import React, { useRef } from 'react';
import { useNotification, useWebcomponents } from 'react-shared';
import { AuthForm, AUTH_FORM_OIDC } from './AuthForm';
import { ContextChooser } from './ContextChooser/ContextChooser';
import { getContext, hasKubeconfigAuth, addCluster } from '../shared';
import { createLoginCommand } from './oidc-params';

export function ClusterConfiguration({
  kubeconfig,
  initParams,
  auth: initialAuth,
  goBack,
}) {
  const [authValid, setAuthValid] = React.useState(false);
  const [auth, setAuth] = React.useState(initialAuth);
  const [contextName, setContextName] = React.useState(null);
  const applyConfigurationButtonRef = useRef();

  const onApply = () => {
    try {
      // update original kk's choosen context
      kubeconfig['current-context'] = contextName;

      const params = {
        kubeconfig,
        config: { ...initParams?.config },
        currentContext: getContext(kubeconfig, contextName),
      };

      if (requireAuth) {
        addAuthToParams(params);
      }

      addCluster(params);
    } catch (e) {
      notification.notifyError({
        title: 'Cannot apply configuration',
        content: 'Error: ' + e.message,
      });
      console.warn(e);
    }
  };

  const notification = useNotification();
  useWebcomponents(applyConfigurationButtonRef, 'click', onApply);

  const requireAuth =
    kubeconfig && contextName && !hasKubeconfigAuth(kubeconfig, contextName);

  React.useEffect(() => {
    if (kubeconfig) setContextName(kubeconfig['current-context']);
  }, [kubeconfig]);

  React.useEffect(() => {
    console.log('authValid', authValid);
  }, [authValid]);

  const addAuthToParams = params => {
    const { type: authType, token, ...oidcConfig } = auth;

    const authConfig =
      authType === AUTH_FORM_OIDC
        ? { exec: createLoginCommand(oidcConfig) }
        : { token };

    const { context } = kubeconfig.contexts.find(c => c.name === contextName);
    const user = params.kubeconfig.users.find(u => u.name === context.user);
    if (user) {
      user.user = authConfig;
    } else {
      params.kubeconfig.users = [
        {
          name: context.user,
          user: authConfig,
        },
      ];
    }
  };

  return (
    <>
      <ContextChooser kubeconfig={kubeconfig} setContextName={setContextName} />
      {requireAuth && (
        <AuthForm auth={auth} setAuth={setAuth} setAuthValid={setAuthValid} />
      )}
      <ui5-button ref={applyConfigurationButtonRef} disabled>
        Apply configuration
      </ui5-button>
    </>
  );
}
