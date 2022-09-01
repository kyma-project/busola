import React, { useState, useMemo, useCallback } from 'react';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';
import { createStore } from '@ui-schema/ui-schema';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { UIMetaProvider } from '@ui-schema/ui-schema/UIMeta';
import { UIStoreProvider, storeUpdater } from '@ui-schema/ui-schema';
import { injectPluginStack } from '@ui-schema/ui-schema/applyPluginStack';

import widgets from './components-form';
// import { prepareSchemaRules } from './SchemaRulesInjector';

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
  ...extraParams
}) {
  const onChange = useCallback(
    actions => {
      setStore(prevStore => storeUpdater(actions)(prevStore));
    },
    [setStore],
  );

  const uiWidgets = useMemo(() => widgets, [widgets]);
  const uiStore = useMemo(() => store, [store]);

  let newSchema = schema;
  delete newSchema.properties.metadata;

  newSchema = {
    ...newSchema,
    properties: { ...newSchema.properties },
  };

  const schemaMap = useMemo(() => createOrderedMap(schema), [newSchema]);

  if (isEmpty(schema)) return null;

  return (
    <UIMetaProvider widgets={uiWidgets}>
      <UIStoreProvider
        store={uiStore}
        showValidity={true}
        onChange={onChange}
        schemaRules={schemaRules}
      >
        <FormStack isRoot schema={schemaMap} resource={resource} />
      </UIStoreProvider>
    </UIMetaProvider>
  );
}
