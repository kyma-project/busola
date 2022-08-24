import React, { useCallback, useState, useEffect } from 'react';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { UIMetaProvider } from '@ui-schema/ui-schema/UIMeta';
import { UIStoreProvider, storeUpdater } from '@ui-schema/ui-schema';
import { injectPluginStack } from '@ui-schema/ui-schema/applyPluginStack';

import widgets from './components-form';
import { prepareSchemaRules } from './SchemaRulesInjector';

function FormContainer({ children }) {
  return (
    <div className="form-container" container="true">
      {children}
    </div>
  );
}
const FormStack = injectPluginStack(FormContainer);

export function ResourceSchema({
  advanced,
  resource,
  schema,
  schemaRules = [],
  path,
  store,
  setStore,
  varStore,
  setVarStore,
  ...extraParams
}) {
  const [rootRule, setRootRule] = useState({});

  const onChange = useCallback(
    actions => {
      setStore(prevStore => storeUpdater(actions)(prevStore));
    },
    [setStore],
  );

  const translationBundle = path || 'extensibility';
  const { t } = useTranslation([translationBundle]); //doesn't always work, add `translationBundle.` at the beggining of a path

  const fullSchemaRules = [
    { path: 'metadata.name', simple: true },
    { path: 'metadata.labels' },
    { path: 'metadata.annotations' },
    ...(Array.isArray(schemaRules) ? schemaRules : []),
  ];
  const simpleRules = fullSchemaRules.filter(item => item.simple ?? false);
  const advancedRules = fullSchemaRules.filter(item => item.advanced ?? true);

  const myRules = advanced ? advancedRules : simpleRules;
  useEffect(() => {
    setRootRule(prepareSchemaRules(myRules));
  }, [schemaRules]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isEmpty(schema)) return null;

  let newSchema = schema;
  delete newSchema.properties.metadata;

  newSchema = {
    ...newSchema,
    properties: { ...newSchema.properties },
  };

  const schemaMap = createOrderedMap(newSchema);
  return (
    <UIMetaProvider
      widgets={widgets}
      t={(path, ...props) => t(`${translationBundle}::${path}`, ...props)}
    >
      <UIStoreProvider
        store={store}
        showValidity={true}
        onChange={onChange}
        rootRule={rootRule}
        varStore={varStore}
        setVarStore={setVarStore}
      >
        <pre>{JSON.stringify(varStore, null, '  ')}</pre>
        <FormStack isRoot schema={schemaMap} resource={resource} />
      </UIStoreProvider>
    </UIMetaProvider>
  );
}
