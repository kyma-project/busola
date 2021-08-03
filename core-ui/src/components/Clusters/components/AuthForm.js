import React, { useRef, useState } from 'react';
import { useWebcomponents } from 'react-shared';

export const AUTH_FORM_TOKEN = 'Token';
export const AUTH_FORM_OIDC = 'OIDC';
export const DEFAULT_SCOPE_VALUE = 'openid ';

const OIDCform = ({ auth, setAuth }) => {
  const issuerUrlRef = useRef();
  const clientIdRef = useRef();
  const scopesRef = useRef();

  useWebcomponents(issuerUrlRef, 'input', e =>
    setAuth({ ...auth, issuerUrl: e.target.value }),
  );
  useWebcomponents(clientIdRef, 'input', e =>
    setAuth({ ...auth, clientId: e.target.value }),
  );
  useWebcomponents(scopesRef, 'input', e =>
    setAuth({ ...auth, scope: e.target.value }),
  );

  return (
    <>
      <ui5-label>Issuer URL</ui5-label>
      <ui5-input key="issuer-url" required type="url" ref={issuerUrlRef} />
      <ui5-label>Client ID</ui5-label>
      <ui5-input key="client-id" required label="Client ID" ref={clientIdRef} />
      <ui5-label>Scopes</ui5-label>
      <ui5-input key="scope" required label="Scopes" ref={scopesRef} />
    </>
  );
};

const TokenForm = ({ auth, setAuth }) => {
  const tokenRef = useRef();

  useWebcomponents(tokenRef, 'input', e =>
    setAuth({ ...auth, token: e.target.value }),
  );
  return (
    <>
      <ui5-label>Token</ui5-label>
      <ui5-input key="token" required ref={tokenRef} />
    </>
  );
};

export function AuthForm({ setAuthValid, auth, setAuth }) {
  const [tokenSelected, setTokenSelected] = useState(true);
  const formRef = useRef();
  const tokenRef = useRef();
  const oidcRef = useRef();

  useWebcomponents(tokenRef, 'select', () => {
    setTokenSelected(true);
    setAuth({ ...auth, type: AUTH_FORM_TOKEN });
  });
  useWebcomponents(oidcRef, 'select', () => {
    setTokenSelected(false);
    setAuth({ ...auth, type: AUTH_FORM_OIDC });
  });

  React.useEffect(() => {
    if (formRef) {
      setAuthValid(formRef.current?.checkValidity());
    }
  }, [formRef, auth, setAuthValid]);

  return (
    <form ref={formRef} onSubmit={e => e.preventDefault()} noValidate>
      <ui5-messagestrip type="Warning">
        It looks like your kubeconfig is incomplete. Please fill the additional
        fields.
      </ui5-messagestrip>
      <ui5-radiobutton text="Token" selected name="authGroup" ref={tokenRef} />
      <ui5-radiobutton text="OIDC provider" name="authGroup" ref={oidcRef} />
      {tokenSelected ? (
        <TokenForm auth={auth} setAuth={setAuth} />
      ) : (
        <OIDCform auth={auth} setAuth={setAuth} />
      )}
    </form>
  );
}
