import React from 'react';
import {
  K8sNameInput,
  useMicrofrontendContext,
  LabelSelectorInput,
  TextFormItem,
  KeyValueForm,
} from 'react-shared';
import { Tab, TabGroup } from 'fundamental-react';
import { createSecretInput, mapObjectValues } from './helpers';
import './SecretForm.scss';
import { DecodeSecretSwitch } from './DecodeSecretSwitch';

export function SecretForm({
  formElementRef,
  onChange,
  setCustomValid,
  secret,
  onSubmit,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [name, setName] = React.useState(secret.metadata.name);
  const [labels, setLabels] = React.useState(secret.metadata.labels);
  const [annotations, setAnnotations] = React.useState(
    secret.metadata.annotations,
  );
  const [data, setData] = React.useState(
    mapObjectValues(atob, secret.data || {}),
  );
  const [isEncoded, setEncoded] = React.useState(false);

  const handleFormSubmit = e => {
    e.preventDefault();
    const secretInput = createSecretInput({
      name,
      namespaceId,
      labels,
      annotations,
      data,
      type: secret.type,
    });
    onSubmit(secretInput);
  };

  return (
    <form onSubmit={handleFormSubmit} onChange={onChange} ref={formElementRef}>
      <TabGroup>
        <Tab title="Metadata">
          <div className="secrets-create__form-flex">
            <div>
              <K8sNameInput
                defaultValue={name}
                onChange={e => setName(e.target.value)}
                kind="Secret"
                className="fd-has-margin-bottom-s"
              />
            </div>
            <TextFormItem
              inputKey="type"
              label="Secret type"
              inputProps={{ value: secret.type, disabled: true }}
            />
          </div>
          <LabelSelectorInput labels={labels} onChange={setLabels} />
          <LabelSelectorInput
            className="fd-has-margin-top-s fd-has-margin-bottom-tiny"
            labels={annotations}
            onChange={setAnnotations}
            type="Annotations"
          />
        </Tab>
        <Tab title="Data">
          <KeyValueForm
            data={data}
            setData={setData}
            setValid={setCustomValid}
            customHeaderAction={(entries, setEntries) => (
              <DecodeSecretSwitch
                entries={entries}
                setEntries={setEntries}
                isEncoded={isEncoded}
                setEncoded={setEncoded}
              />
            )}
          />
        </Tab>
      </TabGroup>
    </form>
  );
}
