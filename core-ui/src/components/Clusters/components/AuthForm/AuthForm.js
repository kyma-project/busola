import React from 'react';
import LuigiClient from '@luigi-project/client';
import { TextFormItem } from 'react-shared';
import { Button, Icon, MessageStrip } from 'fundamental-react';
import { addCluster } from '../../shared';
import { getConfigFromParams } from './../getConfigFromParams';

import './AuthForm.scss';

export function AuthForm({ kubeconfig }) {
  const formRef = React.useRef();
  const [auth, setAuth] = React.useState({
    issuerUrl: '',
    clientId: '',
    scope: '',
  });
  const [isFormValid, setFormValid] = React.useState(false);

  const submitForm = async e => {
    e.preventDefault();
    const config = await getConfigFromParams(LuigiClient.getNodeParams().init);
    const params = {
      kubeconfig,
      config: {
        ...config,
        auth: { ...auth, responseType: 'id_token' },
      },
    };
    addCluster(params);
  };

  const onChange = () => setFormValid(formRef.current?.checkValidity());

  const goBack = () => {
    // we could use setShowingAuthForm(false), but that won't
    // remove search from the URL
    LuigiClient.linkManager().navigate('/clusters/add');
  };

  return (
    <form
      ref={formRef}
      onSubmit={submitForm}
      onChange={onChange}
      className="cluster-auth-form"
    >
      <Button option="transparent" onClick={goBack}>
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
      <Button typeAttr="submit" disabled={!isFormValid} option="emphasized">
        Connect
      </Button>
    </form>
  );
}
