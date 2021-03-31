import React from 'react';

import { Alert, Button } from 'fundamental-react';
import { TextFormItem } from 'react-shared';

export function AuthForm({ onSubmit }) {
  const [auth, setAuth] = React.useState({
    issuerUrl: '',
    clientId: '',
    scope: 'openid',
    responseType: 'id_token',
  });

  const onFormSubmit = e => {
    e.preventDefault();
    onSubmit(auth);
  };

  return (
    <form onSubmit={onFormSubmit} className="fd-has-margin-top-s">
      <Alert type="warning">
        It looks like your kubeconfig is incomplete. Please fill two additional
        fields.
      </Alert>
      <TextFormItem
        className="fd-has-margin-top-s"
        inputKey="issuer-url"
        required
        label="Issuer URL"
        placeholder="Enter issuer URL"
        onChange={e => setAuth({ ...auth, issuerUrl: e.target.value })}
      />
      <TextFormItem
        className="fd-has-margin-top-s"
        inputKey="client-id"
        required
        label="Client ID"
        placeholder="Enter client ID"
        onChange={e => setAuth({ ...auth, clientId: e.target.value })}
      />
      <Button
        className="fd-has-margin-top-s"
        option="emphasized"
        disabled={!auth.issuerUrl || !auth.clientId}
      >
        Connect
      </Button>
    </form>
  );
}
