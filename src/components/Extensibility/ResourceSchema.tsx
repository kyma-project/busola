import {
  useMemo,
  useCallback,
  ReactNode,
  SetStateAction,
  Dispatch,
} from 'react';
import { isEmpty } from 'lodash';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { UIMetaProvider } from '@ui-schema/ui-schema/UIMeta';
import {
  StoreSchemaType,
  UIStoreProvider,
  UIStoreType,
  storeUpdater,
} from '@ui-schema/ui-schema';
import { injectPluginStack } from '@ui-schema/ui-schema/applyPluginStack';

import widgets from './components-form';
import { OrderedMap } from 'immutable';
import { useGetTranslation } from './helpers';

function FormContainer({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
const FormStack = injectPluginStack(FormContainer);

type ResourceSchemaProps = {
  resource: Record<string, any>;
  schema: Record<string, any> | null;
  schemaRules?: Record<string, any>;
  store: UIStoreType<OrderedMap<string | number | symbol, any>>;
  setStore: Dispatch<
    SetStateAction<UIStoreType<OrderedMap<string | number | symbol, any>>>
  >;
  editMode?: boolean;
  path?: string;
};

export function ResourceSchema({
  resource,
  schema,
  schemaRules = {},
  store,
  setStore,
  editMode = false,
  path: _path,
}: ResourceSchemaProps) {
  const { t: translator } = useGetTranslation();
  const onChange = useCallback(
    (actions: any) => {
      setStore((prevStore) => storeUpdater(actions)(prevStore));
    },
    [setStore],
  );

  const uiStore = useMemo(() => store, [store]);

  const schemaMap = useMemo(
    () => createOrderedMap(schema) as StoreSchemaType & OrderedMap<string, any>,
    [schema],
  );

  if (isEmpty(schema)) return null;

  return (
    <UIMetaProvider widgets={widgets as any} t={translator}>
      <UIStoreProvider
        store={uiStore}
        showValidity={true}
        onChange={onChange}
        rootRule={schemaRules}
        editMode={editMode}
      >
        <FormStack isRoot schema={schemaMap} resource={resource} />
      </UIStoreProvider>
    </UIMetaProvider>
  );
}
