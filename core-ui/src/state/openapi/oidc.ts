import { UserManager, UserManagerSettings } from 'oidc-client-ts';
import { AuthDataState } from 'state/authDataAtom';
import { parseOIDCParams } from './parseOIDCParams';

type OidcUser = {
  id_token: string;
};

// todo move this file outta here
export const hasNonOidcAuth = (user?: AuthDataState) => {
  if (!user) {
    return true;
  }

  // either token or a pair (client CA, client key) is present
  if ('token' in user) {
    return !!user.token;
  } else {
    return !!user['client-certificate-data'] && !!user['client-key-data'];
  }
};

export async function handleAuth(setAuth: any, cluster: any, navigate: any) {
  const kubeconfigUser = cluster?.currentContext?.user?.user;
  // do we need to run the OIDC flow?
  if (hasNonOidcAuth(kubeconfigUser)) {
    setAuth(kubeconfigUser);
    navigate(`/cluster/${cluster.contextName}`);
  } else {
    const { issuerUrl, clientId, clientSecret, scope } = parseOIDCParams(
      kubeconfigUser,
    );

    const oidcSettings = {
      redirect_uri: window.location.origin,
      post_logout_redirect_uri: window.location.origin + '/logout.html',
      loadUserInfo: true,
      automaticSilentRenew: false,
      logoutUrl: window.location.origin + '/logout.html',
      client_id: clientId,
      authority: issuerUrl,
      client_secret: clientSecret,
      scope: scope || 'openid',
      response_type: 'code',
      response_mode: 'search', // search?
    };

    const userManager = new UserManager(oidcSettings as UserManagerSettings);

    const storedAuth = await userManager.getUser();

    if (storedAuth) {
      setAuth({ token: storedAuth.id_token });
      userManager.events.addAccessTokenExpiring(async () => {
        const {
          id_token: token,
        } = (await userManager.signinSilent()) as OidcUser;
        setAuth({ token });
      });
      userManager.events.addSilentRenewError(e => {
        console.warn('silent renew failed', e);
        setAuth(null);
        navigate('/clusters');
      });
      return;
    }

    try {
      // try to receive OIDC response
      const { id_token: token } = await userManager.signinRedirectCallback(
        window.location.href,
      );
      userManager.events.addAccessTokenExpiring(async () => {
        const {
          id_token: token,
        } = (await userManager.signinSilent()) as OidcUser;
        setAuth({ token });
      });
      userManager.events.addSilentRenewError(e => {
        console.warn('silent renew failed', e);
        setAuth(null);
      });

      navigate(`/cluster/${cluster.contextName}`);
      console.log('all the login data');

      setAuth({ token });
      return;
    } catch (_) {
      // no response data yet, try to log in
      await userManager.clearStaleState();
      userManager.signinRedirect();
    }
  }
}

// export async function checkIfClusterRequiresCA(url: string, authData) {
//   try {
//     // try to fetch with CA (if 'requiresCA' is undefined => send CA)
//     await fetch(url + '/api', authData);
//     return true;
//   } catch (_) {
//     // if it fails, don't send CA anymore
//     return false;
//   }
// }
