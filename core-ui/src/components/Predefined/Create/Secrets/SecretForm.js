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
import { useTranslation } from 'react-i18next';

export function SecretForm({
  formElementRef,
  onChange,
  setCustomValid,
  secret,
  onSubmit,
  readonlyName,
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
    const secretInput = createSecretInput(
      {
        name,
        namespaceId,
        labels,
        annotations,
        data,
        type: secret.type,
      },
      isEncoded,
    );
    onSubmit(secretInput);
  };

  const { t, i18n } = useTranslation();
  const metadataContent = (
    <>
      <div className="secrets-form-metadata">
        <div>
          <K8sNameInput
            defaultValue={name}
            onChange={e => setName(e.target.value)}
            kind="Secret"
            className="fd-margin-bottom--sm"
            readOnly={readonlyName}
            i18n={i18n}
          />
        </div>
        <TextFormItem
          inputKey="type"
          label={t('secrets.labels.type')}
          inputProps={{ value: secret.type, disabled: true }}
        />
      </div>
      <LabelSelectorInput labels={labels} onChange={setLabels} i18n={i18n} />
      <LabelSelectorInput
        className="fd-margin-top--sm fd-margin-bottom--tiny"
        labels={annotations}
        onChange={setAnnotations}
        type="Annotations"
        i18n={i18n}
      />
    </>
  );

  const secretDataContent = (
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
      i18n={i18n}
    />
  );

  return (
    <form
      onSubmit={handleFormSubmit}
      onChange={onChange}
      ref={formElementRef}
      noValidate
    >
      <TabGroup>
        <Tab title={t('secrets.metadata')}>{metadataContent}</Tab>
        <Tab title={t('secrets.data')}>{secretDataContent}</Tab>
      </TabGroup>
    </form>
  );
}
