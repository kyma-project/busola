import React, { useMemo, useCallback } from 'react';
import { isEmpty } from 'lodash';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { UIMetaProvider } from '@ui-schema/ui-schema/UIMeta';
import { UIStoreProvider, storeUpdater } from '@ui-schema/ui-schema';
import { injectPluginStack } from '@ui-schema/ui-schema/applyPluginStack';

import widgets from './components-form';

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
  updateResource,
  schema,
  schemaRules = [],
  path,
  store,
  setStore,
  varStore,
  setVarStore,
  ...extraParams
}) {
  const onChange = useCallback(
    actions => {
      setStore(prevStore => storeUpdater(actions)(prevStore));
    },
    [setStore],
  );

  const uiStore = useMemo(() => store, [store]);

  const schemaMap = useMemo(() => {
    let newSchema = schema;
    delete newSchema.properties.metadata;

    newSchema = {
      ...newSchema,
      properties: { ...newSchema.properties },
    };

    return createOrderedMap(newSchema);
  }, [schema]);

  if (isEmpty(schema)) return null;

  return (
    <UIMetaProvider widgets={widgets}>
      <UIStoreProvider
        store={uiStore}
        showValidity={true}
        onChange={onChange}
        rootRule={schemaRules}
        updateResource={updateResource}
        varStore={varStore}
        setVarStore={setVarStore}
      >
        <FormStack isRoot schema={schemaMap} resource={resource} />
      </UIStoreProvider>
    </UIMetaProvider>
  );
}
