import React from 'react';
import { TextFormItem } from 'react-shared';
import { MessageStrip } from 'fundamental-react';

export function AuthForm({ setAuthValid, auth, setAuth }) {
  const formRef = React.useRef();

  React.useEffect(() => {
    if (formRef) {
      setAuthValid(formRef.current.checkValidity());
    }
  }, [formRef, auth]);

  return (
    <form ref={formRef}>
      <MessageStrip
        type="warning"
        className="fd-margin-top--sm fd-margin-bottom--sm"
      >
        It looks like your kubeconfig is incomplete. Please fill the additional
        fields.
      </MessageStrip>
      <TextFormItem
        inputKey="issuer-url"
        required
        type="url"
        label="Issuer URL"
        onChange={e => setAuth({ ...auth, issuerUrl: e.target.value })}
        defaultValue={auth.issuerUrl}
      />
      <TextFormItem
        inputKey="client-id"
        required
        label="Client ID"
        onChange={e => setAuth({ ...auth, clientId: e.target.value })}
        defaultValue={auth.clientId}
      />
      <TextFormItem
        inputKey="scope"
        required
        label="Scopes"
        onChange={e => setAuth({ ...auth, scope: e.target.value })}
        defaultValue={auth.scope}
      />
    </form>
  );
}
