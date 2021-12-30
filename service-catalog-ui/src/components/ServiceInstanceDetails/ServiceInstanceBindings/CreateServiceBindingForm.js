import {
  ComboboxInput,
  FormItem,
  FormLabel,
  MessageStrip,
} from 'fundamental-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { randomNameGenerator, K8sNameInput, useGetList } from 'react-shared';
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
  namespace,
}) {
  const { i18n } = useTranslation();
  const [name, setName] = useState(randomNameGenerator());
  const [secretName, setSecretName] = useState('');

  const { data: secrets } = useGetList()(
    `/api/v1/namespaces/${namespace}/secrets`,
    {
      pollingInterval: 7000,
    },
  );

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
      <FormItem>
        <FormLabel className="fd-margin-top--tiny">Secret Name</FormLabel>
        <ComboboxWrapper>
          <ComboboxInput
            required
            compact
            placeholder="Secret Name"
            options={(secrets || [])
              .map(s => s.metadata.name)
              .map(n => ({ key: n, text: n }))}
            selectedKey={secretName}
            typedValue={secretName}
            onSelect={e => setSecretName(e.target.value)}
          />
        </ComboboxWrapper>
      </FormItem>
      <MessageStrip className="fd-margin-top--tiny" type="information">
        If Secret Name is not set a new Secret will be created.
      </MessageStrip>
    </form>
  );
}
