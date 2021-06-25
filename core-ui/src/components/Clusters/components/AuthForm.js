import React from 'react';
import { TextFormItem } from 'react-shared';
import { MessageStrip, FormRadioGroup, FormRadioItem } from 'fundamental-react';

export const AUTH_FORM_TOKEN = 'Token';
export const AUTH_FORM_OIDC = 'OIDC';
export const DEFAULT_SCOPE_VALUE = 'openid ';

const OIDCform = ({ auth, setAuth }) => {
  return (
    <>
      <TextFormItem
        inputKey="issuer-url"
        required
        type="url"
        label="Issuer URL"
        onChange={e => setAuth({ ...auth, issuerUrl: e.target.value })}
        inputProps={{ value: auth.issuerUrl || '' }}
      />
      <TextFormItem
        inputKey="client-id"
        required
        label="Client ID"
        onChange={e => setAuth({ ...auth, clientId: e.target.value })}
        inputProps={{ value: auth.clientId || '' }}
      />
      <TextFormItem
        inputKey="scope"
        required
        label="Scopes"
        onChange={e => setAuth({ ...auth, scope: e.target.value })}
        inputProps={{ value: auth.scope || DEFAULT_SCOPE_VALUE }}
      />
    </>
  );
};

export function AuthForm({ setAuthValid, auth, setAuth }) {
  const formRef = React.useRef();

  React.useEffect(() => {
    if (formRef) {
      setAuthValid(formRef.current?.checkValidity());
    }
  }, [formRef, auth, setAuthValid]);

  const tokenForm = (
    <TextFormItem
      inputKey="token"
      required
      label="Token"
      onChange={e => setAuth({ ...auth, token: e.target.value })}
      defaultValue={auth.token}
    />
  );

  return (
    <form ref={formRef}>
      <MessageStrip
        type="warning"
        className="fd-margin-top--sm fd-margin-bottom--sm"
      >
        It looks like your kubeconfig is incomplete. Please fill the additional
        fields.
      </MessageStrip>
      <FormRadioGroup
        className="fd-margin-bottom--sm"
        inline
        onChange={(_, type) => setAuth({ ...auth, type })}
      >
        <FormRadioItem
          inputProps={{ defaultChecked: auth.type === AUTH_FORM_TOKEN }}
          data={AUTH_FORM_TOKEN}
        >
          Token
        </FormRadioItem>
        <FormRadioItem
          inputProps={{ defaultChecked: auth.type === AUTH_FORM_OIDC }}
          data={AUTH_FORM_OIDC}
        >
          OIDC provider
        </FormRadioItem>
      </FormRadioGroup>
      {auth.type === AUTH_FORM_OIDC ? (
        <OIDCform auth={auth} setAuth={setAuth} />
      ) : (
        tokenForm
      )}
    </form>
  );
}
