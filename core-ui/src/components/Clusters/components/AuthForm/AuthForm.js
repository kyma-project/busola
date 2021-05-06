import React from 'react';
import { TextFormItem } from 'react-shared';
import { Button, Icon, MessageStrip } from 'fundamental-react';
import { addCluster } from '../../shared';
import './AuthForm.scss';

export function AuthForm({ cluster, setShowNoAuth }) {
  const formRef = React.useRef();
  const [auth, setAuth] = React.useState({
    issuerUrl: 'https://apskyxzcl.accounts400.ondemand.com',
    clientId: 'd0316c58-b0fe-45cd-9960-0fea0708355a',
    scope: 'openid',
  });
  const [isFormValid, setFormValid] = React.useState(false);

  const submitForm = e => {
    e.preventDefault();
    const params = {
      cluster,
      auth: { ...auth, responseType: 'id_token' },
    };
    addCluster(params);
  };

  const onChange = () => setFormValid(!formRef.current?.checkValidity());

  return (
    <form
      ref={formRef}
      onSubmit={submitForm}
      onChange={onChange}
      className="cluster-auth-form"
    >
      <Button option="transparent" onClick={() => setShowNoAuth(false)}>
        <Icon
          glyph="arrow-left"
          ariaLabel="back"
          className="fd-margin-end--tiny"
        />
        Back
      </Button>
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
        onChange={e => setAuth({ ...auth, cliendId: e.target.value })}
        defaultValue={auth.clientId}
      />
      <TextFormItem
        inputKey="scope"
        required
        label="Scopes"
        onChange={e => setAuth({ ...auth, scope: e.target.value })}
        defaultValue={auth.scope}
      />
      <Button typeAttr="submit" disabled={isFormValid} option="emphasized">
        Connect
      </Button>
    </form>
  );
}
