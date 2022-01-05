import { FormItem, MessageStrip } from 'fundamental-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { randomNameGenerator, K8sNameInput } from 'react-shared';
import styled from 'styled-components';

const ComboboxWrapper = styled.div`
  .fd-popover {
    width: 100%;
  }

  input {
    height: 2.5em;
  }
`;

export function CreateServiceBindingForm({
  onChange,
  formElementRef,
  handleFormSubmit,
}) {
  const { i18n } = useTranslation();
  const [name, setName] = useState(randomNameGenerator());
  const [secretName, setSecretName] = useState('');

  return (
    <form
      ref={formElementRef}
      style={{ width: '30em' }}
      onChange={onChange}
      onSubmit={() => handleFormSubmit(name, secretName)}
      noValidate
    >
      <FormItem>
        <K8sNameInput
          onChange={e => setName(e.target.value)}
          kind="Service Binding"
          i18n={i18n}
          value={name}
        />
      </FormItem>

      <MessageStrip className="fd-margin-top--tiny" type="information">
        The Secret will be created automatically.
      </MessageStrip>
    </form>
  );
}
