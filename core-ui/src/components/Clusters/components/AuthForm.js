import React, { useRef, useState } from 'react';
import { useWebcomponents } from 'react-shared';

export const AUTH_FORM_TOKEN = 'Token';
export const AUTH_FORM_OIDC = 'OIDC';
export const DEFAULT_SCOPE_VALUE = 'openid ';

const OIDCform = ({
  auth,
  setAuth,
  issuerUrlInputRef,
  clientIdInputRef,
  scopesInputRef,
}) => {
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
        value={auth.scope || DEFAULT_SCOPE_VALUE} //fix
      />
    </>
  );
};

const TokenForm = ({ auth, setAuth, tokenInputRef }) => {
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

const checkOIDCFormValidity = ({
  issuerUrlInputRef,
  clientIdInputRef,
  scopesInputRef,
}) => {
  return !!(
    issuerUrlInputRef.current?.value &&
    clientIdInputRef.current?.value &&
    scopesInputRef.current?.value &&
    (issuerUrlInputRef.current?.value.startsWith('https://') ||
      issuerUrlInputRef.current?.value.startsWith('http://'))
  );
};

const checkTokenFormValidity = ({ tokenInputRef }) => {
  return !!tokenInputRef.current.value;
};

export function AuthForm({ auth, setAuth, applyConfigurationButtonRef }) {
  const [tokenSelected, setTokenSelected] = useState(true);
  const formRef = useRef();
  const tokenSelectRef = useRef();
  const oidcSelectRef = useRef();
  const issuerUrlInputRef = useRef();
  const clientIdInputRef = useRef();
  const scopesInputRef = useRef();
  const tokenInputRef = useRef();

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
      let formValid;
      if (tokenSelected) {
        formValid = checkTokenFormValidity({ tokenInputRef });
      } else {
        formValid = checkOIDCFormValidity({
          issuerUrlInputRef,
          clientIdInputRef,
          scopesInputRef,
        });
      }
      applyConfigurationButtonRef.current.disabled = !formValid;
    }
  }, [formRef, auth, applyConfigurationButtonRef]);

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
        <TokenForm
          auth={auth}
          setAuth={setAuth}
          tokenInputRef={tokenInputRef}
        />
      ) : (
        <OIDCform
          auth={auth}
          setAuth={setAuth}
          issuerUrlInputRef={issuerUrlInputRef}
          clientIdInputRef={clientIdInputRef}
          scopesInputRef={scopesInputRef}
        />
      )}
    </form>
  );
}
