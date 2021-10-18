import React, { useState } from 'react';
import { useMicrofrontendContext } from 'react-shared';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import {
  K8sNameField,
  KeyValueField,
  DataField,
} from 'shared/ResourceForm/components/FormComponents';

import { createConfigMapTemplate, createPresets } from './helpers';

export function ConfigMapForm({
  formElementRef,
  onChange,
  setCustomValid,
  configMap: initialConfigMap,
  readonlyName,
  resourceUrl,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [configMap, setConfigMap] = useState(
    initialConfigMap || createConfigMapTemplate(),
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
      <DataField defaultOpen propertyPath="$.data" />
    </ResourceForm>
  );
}
