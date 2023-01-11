import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { K8sNameField, Editor } from 'shared/ResourceForm/fields';
import * as jp from 'jsonpath';

import { createConfigMapTemplate, SECTIONS } from './helpers';
import { EXTENSION_VERSION_LABEL } from './constants';

export function BusolaExtensionEdit({
  namespace,
  formElementRef,
  onChange,
  setCustomValid,
  resource: initialExtension,
  resourceUrl,
  ...props
}) {
  const [extension, setExtension] = useState(
    initialExtension
      ? cloneDeep(initialExtension)
      : createConfigMapTemplate(namespace || ''),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
      {...props}
      pluralKind="configmaps"
      singularName={t('config-maps.name_singular')}
      resource={extension}
      initialResource={initialExtension}
      setResource={setExtension}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
    >
      <K8sNameField
        readOnly={true}
        propertyPath="$.metadata.name"
        kind="ConfigMap"
        validate={value => !!value}
      />
      <ResourceForm.FormField
        required
        value={jp.value(
          extension,
          `$.metadata.labels["${EXTENSION_VERSION_LABEL}"]`,
        )}
        setValue={(val, setter) => {
          jp.value(
            extension,
            `$.metadata.labels["${EXTENSION_VERSION_LABEL}"]`,
            val,
          );
          setExtension({ ...extension });
        }}
        label={t('extensibility.sections.version')}
        input={Inputs.Text}
        pattern="^[0-9]+\.[0-9]+$"
      />
      {SECTIONS.map(key => (
        <ResourceForm.CollapsibleSection
          title={t(`extensibility.sections.${key}`)}
          defaultOpen
        >
          <Editor
            language="yaml"
            height="240px"
            propertyPath={`$.data.${key}`}
            autocompletionDisabled
            updateValueOnParentChange
            convert={false}
          />
        </ResourceForm.CollapsibleSection>
      ))}
    </ResourceForm>
  );
}
BusolaExtensionEdit.allowEdit = true;
