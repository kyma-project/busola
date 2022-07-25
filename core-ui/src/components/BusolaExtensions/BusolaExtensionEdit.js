import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { K8sNameField } from 'shared/ResourceForm/fields';
import { Editor } from 'shared/ResourceForm/fields/Editor';

import { createConfigMapTemplate, SECTIONS } from './helpers';

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
      {Object.keys(extension.data ?? {})
        .filter(key => key.match(/^translations-..$/))
        .map(key => (
          <ResourceForm.CollapsibleSection
            title={t('extensibility.sections.lang-translations', {
              lang: key.substring(key.length - 2),
            })}
            defaultOpen
          >
            <Editor
              language="yaml"
              height="240px"
              propertyPath={`$.data['${key}']`}
              autocompletionDisabled
              updateValueOnParentChange
              convert={false}
            />
          </ResourceForm.CollapsibleSection>
        ))}
      {/*
      <RichEditorDataField
        defaultOpen
        propertyPath="$.data"
        collapsible={false}
      />
      */}
    </ResourceForm>
  );
}
BusolaExtensionEdit.allowEdit = true;
