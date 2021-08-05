import React, { useRef, useState } from 'react';
import { useWebcomponents } from 'react-shared';

export const AUTH_FORM_TOKEN = 'Token';
export const AUTH_FORM_OIDC = 'OIDC';
export const DEFAULT_SCOPE_VALUE = 'openid ';

const OIDCform = ({ auth, setAuth }) => {
  const issuerUrlInputRef = useRef();
  const clientIdInputRef = useRef();
  const scopesInputRef = useRef();

  useWebcomponents(issuerUrlInputRef, 'input', e =>
    setAuth({ ...auth, issuerUrl: e.target.value }),
  );
  useWebcomponents(clientIdInputRef, 'input', e =>
    setAuth({ ...auth, clientId: e.target.value }),
  );
  useWebcomponents(scopesInputRef, 'input', e =>
    setAuth({ ...auth, scope: e.target.value }),
  );

  return (
    <>
      <ui5-label>Issuer URL</ui5-label>
      <ui5-input
        key="issuer-url"
        required
        type="url"
        ref={issuerUrlInputRef}
        value={auth.issuerUrl || ''}
      />
      <ui5-label>Client ID</ui5-label>
      <ui5-input
        key="client-id"
        required
        label="Client ID"
        ref={clientIdInputRef}
        value={auth.clientId || ''}
      />
      <ui5-label>Scopes</ui5-label>
      <ui5-input
        key="scope"
        required
        label="Scopes"
        ref={scopesInputRef}
        value={auth.scope || DEFAULT_SCOPE_VALUE}
      />
    </>
  );
};

const TokenForm = ({ auth, setAuth }) => {
  const tokenInputRef = useRef();

  useWebcomponents(tokenInputRef, 'input', e =>
    setAuth({ ...auth, token: e.target.value }),
  );
  return (
    <>
      <ui5-label>Token</ui5-label>
      <ui5-input
        key="token"
        required
        ref={tokenInputRef}
        value={auth.token || ''}
      />
    </>
  );
};

export function AuthForm({ setAuthValid, auth, setAuth }) {
  const [tokenSelected, setTokenSelected] = useState(true);
  const formRef = useRef();
  const tokenSelectRef = useRef();
  const oidcSelectRef = useRef();

  useWebcomponents(tokenSelectRef, 'select', () => {
    setTokenSelected(true);
    setAuth({ ...auth, type: AUTH_FORM_TOKEN });
  });
  useWebcomponents(oidcSelectRef, 'select', () => {
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
      <ui5-radiobutton
        text="Token"
        selected
        name="authGroup"
        ref={tokenSelectRef}
      />
      <ui5-radiobutton
        text="OIDC provider"
        name="authGroup"
        ref={oidcSelectRef}
      />
      {tokenSelected ? (
        <TokenForm auth={auth} setAuth={setAuth} />
      ) : (
        <OIDCform auth={auth} setAuth={setAuth} />
      )}
    </form>
  );
}
