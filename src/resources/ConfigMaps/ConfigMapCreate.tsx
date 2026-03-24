import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { RichEditorDataField } from 'shared/ResourceForm/fields';

import { createConfigMapTemplate, createPresets } from './helpers';
import { getDescription, SchemaContext } from 'shared/helpers/schema';
import { ResourceFormProps } from 'shared/ResourceForm/components/ResourceForm';

type ConfigMapCreateProps = {
  namespace?: string;
  resource?: Record<string, any>;
  resourceUrl?: string;
} & Omit<
  ResourceFormProps,
  | 'pluralKind'
  | 'singularName'
  | 'resource'
  | 'initialResource'
  | 'updateInitialResource'
  | 'setResource'
  | 'presets'
  | 'createUrl'
  | 'nameProps'
>;

export default function ConfigMapCreate({
  namespace,
  formElementRef,
  onChange,
  setCustomValid,
  resource: initialConfigMap,
  resourceUrl,
  ...props
}: ConfigMapCreateProps) {
  const { t } = useTranslation();

  const [configMap, setConfigMap] = useState(
    initialConfigMap
      ? cloneDeep(initialConfigMap)
      : createConfigMapTemplate(namespace || ''),
  );

  const [initialResource, setInitialResource] = useState(
    initialConfigMap || createConfigMapTemplate(namespace || ''),
  );
  const [prevNamespace, setPrevNamespace] = useState(namespace);

  if (
    (initialConfigMap && initialConfigMap !== initialResource) ||
    namespace !== prevNamespace
  ) {
    setPrevNamespace(namespace);
    setConfigMap(
      initialConfigMap
        ? cloneDeep(initialConfigMap)
        : createConfigMapTemplate(namespace || ''),
    );
    setInitialResource(
      initialConfigMap || createConfigMapTemplate(namespace || ''),
    );
  }

  const schema = useContext(SchemaContext);
  const dataDesc = getDescription(schema, 'data') ?? '';

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
      presets={createPresets([]) ?? undefined}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      nameProps={{ readOnly: !!initialConfigMap?.metadata?.name }}
    >
      {/* @ts-expect-error Type mismatch between js and ts */}
      <RichEditorDataField
        propertyPath="$.data"
        tooltipContent={t(dataDesc, { defaultValue: dataDesc })}
      />
    </ResourceForm>
  );
}
ConfigMapCreate.allowClone = true;
