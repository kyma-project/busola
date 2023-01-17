import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { RichEditorDataField } from 'shared/ResourceForm/fields';

import { createConfigMapTemplate, createPresets } from './helpers';

export function ConfigMapCreate({
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
      presets={createPresets([], namespace || '', t)}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      nameProps={{ readOnly: !!initialConfigMap?.metadata?.name }}
    >
      <RichEditorDataField defaultOpen propertyPath="$.data" />
    </ResourceForm>
  );
}
ConfigMapCreate.allowEdit = true;
ConfigMapCreate.allowClone = true;
