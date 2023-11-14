import { MessageStrip } from '@ui5/webcomponents-react';
import { useFeature } from 'hooks/useFeature';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserManager } from 'state/authDataAtom';
import { KubeconfigOIDCAuth } from 'types';
import { GardenerLoginFeature } from './GardenerLoginFeature';
import { useGardenerLogin } from './useGardenerLoginFunction';

import { spacing } from '@ui5/webcomponents-react-base';

export default function GardenerLogin() {
  const [token, setToken] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [report, setReport] = useState('');

  const { t } = useTranslation();

  const gardenerFeature = useFeature<GardenerLoginFeature>('GARDENER_LOGIN');
  const navigate = useNavigate();
  const performGardenerLogin = useGardenerLogin(setReport);

  useEffect(() => {
    const getToken = async () => {
      const user = gardenerFeature.kubeconfig.users[0].user;
      if ('token' in user) {
        // no need for OIDC login
        setToken(user.token);
      } else {
        const auth = user as KubeconfigOIDCAuth;
        const userManager = createUserManager(auth, '/gardener-login');
        try {
          const storedUser = await userManager.getUser();
          const user =
            storedUser && !storedUser.expired
              ? storedUser
              : await userManager.signinRedirectCallback(window.location.href);

          setToken(user.id_token!);
        } catch (e) {
          // ignore 'No state in response' error - it means we didn't fire login request yet
          if (!(e as Error).message.includes('No state in response')) {
            console.warn('Login eror: ' + e);
          } else {
            // no response data yet, try to log in
            await userManager.clearStaleState();
            userManager.signinRedirect();
          }
        }
      }
    };
    getToken();
  }, [gardenerFeature]);

  useEffect(() => {
    const login = async () => {
      try {
        const serverAddress =
          gardenerFeature.kubeconfig.clusters[0].cluster.server;
        await performGardenerLogin(serverAddress, token);
        navigate('/clusters');
      } catch (e) {
        setError(e as Error);
      }
    };

    if (token) {
      login();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div style={{ marginRight: '260px' }}>
      <MessageStrip
        design="Information"
        hideCloseButton
        style={spacing.sapUiSmallMarginTop}
      >
        {report}
      </MessageStrip>
      {error && (
        <MessageStrip
          design="Negative"
          hideCloseButton
          style={spacing.sapUiSmallMarginTop}
        >
          {t('clusters.gardener.error', { message: error.message })}
        </MessageStrip>
      )}
    </div>
  );
}
