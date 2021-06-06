import React from 'react';
import { useNotification } from 'react-shared';
import { AuthForm, AUTH_FORM_OIDC } from './AuthForm';
import { ContextChooser } from './ContextChooser/ContextChooser';
import { getContext, hasKubeconfigAuth, addCluster } from '../shared';
import { Button, Icon } from 'fundamental-react';

export function ClusterConfiguration({
  kubeconfig,
  initParams,
  auth: initialAuth,
  goBack,
}) {
  const [authValid, setAuthValid] = React.useState(false);
  const [auth, setAuth] = React.useState(initialAuth);
  const [contextName, setContextName] = React.useState(null);
  const notification = useNotification();

  const requireAuth = kubeconfig && !hasKubeconfigAuth(kubeconfig, contextName);

  React.useEffect(() => {
    setContextName(kubeconfig['current-context']);
  }, [kubeconfig]);

  const addAuthToParams = params => {
    const { type: authType, token, ...oidcConfig } = auth;
    if (authType === AUTH_FORM_OIDC) {
      // just add OIDC params to configuration
      params.config.auth = oidcConfig;
    } else {
      // add token to current context's user
      const { context } = kubeconfig.contexts.find(c => c.name === contextName);
      const user = params.kubeconfig.users.find(u => u.name === context.user);
      if (user) {
        user.user = { token };
      } else {
        params.kubeconfig.users = [
          {
            name: context.user,
            user: { token },
          },
        ];
      }
    }
  };

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

  return (
    <>
      <Button option="transparent" onClick={goBack}>
        <Icon
          glyph="arrow-left"
          ariaLabel="back"
          className="fd-margin-end--tiny"
        />
        Back
      </Button>
      <ContextChooser kubeconfig={kubeconfig} setContextName={setContextName} />
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
    </>
  );
}
