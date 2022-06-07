import { useEffect, useRef, useState } from 'react';
import { UserManager } from 'oidc-client';
import jwtDecode from 'jwt-decode';

const authData = {
  issuerUrl: 'https://apskyxzcl.accounts400.ondemand.com',
  clientId: 'd0316c58-b0fe-45cd-9960-0fea0708355a',
  response_mode: 'code',
  response_type: 'token',
};

const settings = {
  redirect_uri: window.location.origin,
  post_logout_redirect_uri: window.location.origin + '/logout.html',
  response_type: authData.response_type,
  loadUserInfo: true,
  automaticSilentRenew: true,
  logoutUrl: window.location.origin + '/logout.html',
  authority: authData.issuerUrl,
  client_id: authData.clientId,
  scope: 'openid',
  response_mode: authData.response_mode,
};

const um = new UserManager(settings);

export default function App() {
  const [auth, setAuth] = useState(JSON.parse(sessionStorage.getItem('AUTH')));
  const expTimeout = useRef();

  useEffect(() => {
    const startExpirationInterval = auth => {
      clearTimeout(expTimeout.current);
      const timeoutMs = auth.exp * 1000 - Date.now();

      const pinging = setInterval(() => {
        console.log('left (s): ', auth.exp - Date.now() / 1000);
      }, 1000);

      expTimeout.current = setTimeout(() => {
        console.log('AUTH EXPIRED');
        clearInterval(pinging);

        setAuth(null);
        sessionStorage.setItem('AUTH', null);

        // won't work, better just refresh the page or run um.signinRedirect();
        // console.log("trying to silent", um);
        // um.signinSilent().then(console.log).catch(console.log);
        um.signinRedirect();
      }, timeoutMs);
    };

    if (auth) {
      startExpirationInterval(auth);
      return;
    }

    if (window.location.hash.startsWith('#access_token')) {
      const token = window.location.hash
        .substring(1)
        .split('&')
        .find(d => d.startsWith('access_token'))
        .split('=')[1];

      const auth = jwtDecode(token);

      sessionStorage.setItem('AUTH', JSON.stringify(auth));
      setAuth(auth);

      window.location.replace('/');
      startExpirationInterval(auth);
      return;
    }

    um.signinRedirect();
  }, [auth]);

  if (auth) {
    return (
      <div>
        "Exp date: " {new Date(auth.exp * 1000).toString()}
        <button
          onClick={() => {
            sessionStorage.setItem('AUTH', null);
            setAuth(null);
          }}
        >
          Logout
        </button>
      </div>
    );
  } else {
    return 'no auth';
  }
}
