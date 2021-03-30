import React from 'react';

import { Button } from 'fundamental-react';
import { TextFormItem } from 'react-shared';

export default function AuthForm({ onSubmit }) {
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
    <form onSubmit={onFormSubmit}>
      <TextFormItem
        inputKey="issuer-url"
        required
        label="Issuer URL"
        placeholder="Enter issuer URL"
        onChange={e => setAuth({ ...auth, issuerUrl: e.target.value })}
      />
      <TextFormItem
        inputKey="client-id"
        required
        label="Client ID"
        placeholder="Enter client ID"
        onChange={e => setAuth({ ...auth, clientId: e.target.value })}
      />
      <Button disabled={!auth.issuerUrl || !auth.clientId}>Connect</Button>
    </form>
  );
}
