import React, { useState } from 'react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import {
  K8sNameField,
  KeyValueField,
  DataField,
} from 'shared/ResourceForm/fields';

import { createConfigMapTemplate, createPresets } from './helpers';

export function ConfigMapCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resource: initialConfigMap,
  resourceUrl,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [configMap, setConfigMap] = useState(
    initialConfigMap ? cloneDeep(initialConfigMap) : createConfigMapTemplate(),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
      pluralKind="configmaps"
      singularName={t('config-maps.name_singular')}
      resource={configMap}
      initialResource={initialConfigMap}
      setResource={setConfigMap}
      onChange={onChange}
      formElementRef={formElementRef}
      presets={createPresets([], namespaceId, t)}
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
      <DataField defaultOpen propertyPath="$.data" />
    </ResourceForm>
  );
}
ConfigMapCreate.allowEdit = true;
ConfigMapCreate.allowClone = true;
