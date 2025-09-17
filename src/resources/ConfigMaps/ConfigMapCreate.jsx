import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { RichEditorDataField } from 'shared/ResourceForm/fields';

import { createConfigMapTemplate, createPresets } from './helpers';
import { getDescription, SchemaContext } from 'shared/helpers/schema';

export default function ConfigMapCreate({
  namespace,
  formElementRef,
  onChange,
  setCustomValid,
  resource: initialConfigMap,
  resourceUrl,
  ...props
}) {
  const { t } = useTranslation();

  const [configMap, setConfigMap] = useState(
    initialConfigMap
      ? cloneDeep(initialConfigMap)
      : createConfigMapTemplate(namespace || ''),
  );

  const [initialResource, setInitialResource] = useState(
    initialConfigMap || createConfigMapTemplate(namespace || ''),
  );

  useEffect(() => {
    setConfigMap(
      initialConfigMap
        ? cloneDeep(initialConfigMap)
        : createConfigMapTemplate(namespace || ''),
    );
    setInitialResource(
      initialConfigMap || createConfigMapTemplate(namespace || ''),
    );
  }, [initialConfigMap, namespace]);

  const schema = useContext(SchemaContext);
  const dataDesc = getDescription(schema, 'data');

  return (
    <ResourceForm
      {...props}
      pluralKind="configmaps"
      singularName={t('config-maps.name_singular')}
      resource={configMap}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setConfigMap}
      onChange={onChange}
      formElementRef={formElementRef}
      presets={createPresets([], namespace || '', t)}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      nameProps={{ readOnly: !!initialConfigMap?.metadata?.name }}
    >
      <RichEditorDataField
        defaultOpen
        propertyPath="$.data"
        tooltipContent={t(dataDesc)}
      />
    </ResourceForm>
  );
}
ConfigMapCreate.allowClone = true;
