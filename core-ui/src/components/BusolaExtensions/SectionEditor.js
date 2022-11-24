import React, { useMemo, useState } from 'react';
import { UIMetaProvider } from '@ui-schema/ui-schema/UIMeta';
import {
  UIStoreProvider,
  storeUpdater,
  createStore,
} from '@ui-schema/ui-schema';
import { injectPluginStack } from '@ui-schema/ui-schema/applyPluginStack';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import jsyaml from 'js-yaml';
import { fromJS } from 'immutable';

import { ResourceForm } from 'shared/ResourceForm';
import { limitedWidgets } from 'components/Extensibility/components-form';
import { getResourceObjFromUIStore } from 'components/Extensibility/helpers/immutableConverter';

function FormContainer({ children }) {
  return (
    <div className="form-container" container="true">
      {children}
    </div>
  );
}
const FormStack = injectPluginStack(FormContainer);

export function SectionEditor({ data, schema, onlyYaml, formElementRef }) {
  const [store, setStore] = useState(() =>
    createStore(fromJS(jsyaml.load(data))),
  );
  const resource = useMemo(() => getResourceObjFromUIStore(store), [store]);
  const schemaMap = useMemo(() => createOrderedMap(schema), [schema]);

  const onChange = actions => {
    setStore(prevStore => storeUpdater(actions)(prevStore));
  };

  return (
    <UIMetaProvider widgets={limitedWidgets}>
      <UIStoreProvider store={store} showValidity={true} onChange={onChange}>
        <ResourceForm
          resource={resource}
          initialResource={resource}
          disableDefaultFields
          onlyYaml={onlyYaml}
          formElementRef={formElementRef}
        >
          <FormStack isRoot schema={schemaMap} resource={resource} />
        </ResourceForm>
      </UIStoreProvider>
    </UIMetaProvider>
  );
}
