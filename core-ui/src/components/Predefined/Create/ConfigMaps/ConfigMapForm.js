import React, { useState } from 'react';
import {
  K8sNameInput,
  useMicrofrontendContext,
  LabelSelectorInput,
  KeyValueForm,
} from 'react-shared';
import { Tab, TabGroup } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import {
  MultiInput,
  K8sNameField,
  KeyValueField,
  DataField,
  Labels,
  Annotations,
} from 'shared/ResourceForm/components/FormComponents';

import { createConfigMapTemplate, createPresets } from './helpers';

// import { createConfigMapInput } from './createConfigMapInput';

export function ConfigMapForm({
  formElementRef,
  onChange,
  setCustomValid,
  configMap: initialConfigMap,
  onSubmit,
  readonlyName,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [configMap, setConfigMap] = useState(
    initialConfigMap || createConfigMapTemplate(),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
      resource={configMap}
      setResource={setConfigMap}
      presets={createPresets([], namespaceId, t)}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('config-maps.name_singular')}
        setValue={name => {
          jp.value(configMap, '$.metadata.name', name);
          jp.value(
            configMap,
            "$.metadata.labels['app.kubernetes.io/name']",
            name,
          );
          setConfigMap({ ...configMap });
        }}
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />
      <DataField propertyPath="$.data" />
      {/*
    <KeyValueField
      advanced
      fullWidth
      propertyPath="$.data"
      title={t('config-maps.data')}
      input={({ value, setValue, ref, onBlur, focus }) => (
        <FormTextarea
          compact
          key="value"
          value={dataValue(value)}
          ref={ref}
          onChange={e =>
            setValue({
              ...value,
              val: valuesEncoded
                ? e.target.value
                : base64Encode(e.target.value),
            })
          }
          onKeyDown={e => focus(e)}
          onBlur={onBlur}
          placeholder={t('components.key-value-field.enter-value')}
          className="value-textarea"
          validationState={
            value?.key &&
            decodeErrors[value.key] && {
              state: 'error',
              text: t('secrets.messages.decode-error', {
                message: decodeErrors[value.key],
              }),
            }
          }
        />
      )}
    />
    */}
    </ResourceForm>
  );
  /*

  const [name, setName] = React.useState(configMap.metadata.name);
  const [labels, setLabels] = React.useState(configMap.metadata.labels);
  const [data, setData] = React.useState(configMap.data || {});

  const handleFormSubmit = e => {
    e.preventDefault();
    const configMapInput = createConfigMapInput(
      name,
      namespaceId,
      labels,
      data,
    );
    onSubmit(configMapInput);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      onChange={onChange}
      ref={formElementRef}
      noValidate
    >
      <TabGroup style={{ padding: 0 }}>
        <Tab title="Metadata">
          <K8sNameInput
            onChange={e => setName(e.target.value)}
            kind="Config Map"
            className="fd-margin-bottom--sm"
            defaultValue={name}
            readOnly={readonlyName}
            i18n={i18n}
          />
          <LabelSelectorInput
            labels={labels}
            onChange={setLabels}
            i18n={i18n}
          />
        </Tab>
        <Tab title="Data">
          <KeyValueForm
            data={data}
            setData={setData}
            setValid={setCustomValid}
            i18n={i18n}
          />
        </Tab>
      </TabGroup>
    </form>
  );
  */
}
