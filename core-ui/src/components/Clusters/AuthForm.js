import React from 'react';
import { TextFormItem } from 'react-shared';
import { Button } from 'fundamental-react';

export function AuthForm({ auth, setAuth, onSubmit }) {
  const formRef = React.useRef();
  const [isFormValid, setFormValid] = React.useState(false);

  const submitForm = e => {
    e.preventDefault();
    onSubmit();
  };

  const onChange = () => setFormValid(!formRef.current?.checkValidity());

  return (
    <form ref={formRef} onSubmit={submitForm} onChange={onChange}>
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
        dawaj
      </Button>
    </form>
  );
}
