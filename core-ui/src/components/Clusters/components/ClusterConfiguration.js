import React from 'react';
import { useNotification } from 'react-shared';
import { AuthForm, AUTH_FORM_OIDC } from './AuthForm';
import { ContextChooser } from './ContextChooser/ContextChooser';
import { getContext, hasKubeconfigAuth, addCluster } from '../shared';
import { Button, Icon } from 'fundamental-react';

const OIDC_PARAM_NAMES = new Map([
  ['--oidc-issuer-url', 'issuerUrl'],
  ['--oidc-client-id', 'clientId'],
  ['--oidc-extra-scope', 'scope'],
]);

export function parseOIDCparams({ exec: commandData }) {
  if (!commandData || !commandData.args) throw new Error('No args provided');
  let output = {};

  commandData.args.forEach(arg => {
    const [argKey, argValue] = arg.split('=');
    if (!OIDC_PARAM_NAMES.has(argKey)) return;

    const outputKey = OIDC_PARAM_NAMES.get(argKey);
    if (output[outputKey]) output[outputKey] += ' ' + argValue;
    else output[outputKey] = argValue;
  });

  return output;
}

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

  React.useEffect(() => {
    if (Object.keys(auth).length > 1) return; // Some properties were already predefined for the auth. Filling them again would cause an infinite loop.
    fillAuthFromKubeconfig();
  }, [auth, kubeconfig, setAuth]);

  React.useEffect(() => {
    fillAuthFromKubeconfig();
  }, [contextName]);

  function fillAuthFromKubeconfig() {
    if (auth.type !== AUTH_FORM_OIDC || !kubeconfig || !contextName) return;
    const { context } = kubeconfig.contexts.find(c => c.name === contextName);
    const user = kubeconfig.users.find(u => u.name === context.user);
    try {
      const parsedParams = parseOIDCparams(user?.user);
      setAuth({
        ...auth,
        ...parsedParams,
      });
    } catch (e) {
      console.debug('Failed to parse predefined OIDC args', e);
    }
  }

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
