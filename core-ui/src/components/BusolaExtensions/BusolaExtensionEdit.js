import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import {
  K8sNameField,
  KeyValueField,
  RichEditorDataField,
} from 'shared/ResourceForm/fields';

import { createConfigMapTemplate } from './helpers';

export function BusolaExtensionEdit({
  namespace,
  formElementRef,
  onChange,
  setCustomValid,
  resource: initialConfigMap,
  resourceUrl,
  ...props
}) {
  const [configMap, setConfigMap] = useState(
    initialConfigMap
      ? cloneDeep(initialConfigMap)
      : createConfigMapTemplate(namespace || ''),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
      {...props}
      pluralKind="configmaps"
      singularName={t('config-maps.name_singular')}
      resource={configMap}
      initialResource={initialConfigMap}
      setResource={setConfigMap}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
    >
      <K8sNameField
        readOnly={!!initialConfigMap?.metadata?.name}
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
        validate={value => !!value}
      />
      <RichEditorDataField
        defaultOpen
        propertyPath="$.data"
        collapsible={false}
      />
    </ResourceForm>
  );
}
BusolaExtensionEdit.allowEdit = true;
// BusolaExtensionEdit.allowClone = true;
