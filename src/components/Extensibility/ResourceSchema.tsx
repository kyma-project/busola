import {
  useMemo,
  useCallback,
  SetStateAction,
  Dispatch,
  ComponentType,
} from 'react';
import { isEmpty } from 'lodash';
import { createOrderedMap } from '@ui-schema/ui-schema/createMap';
import { UIMetaProvider } from '@ui-schema/react/UIMeta';
import { UIStoreProvider, UIStoreType } from '@ui-schema/react/UIStore';
import { storeUpdater } from '@ui-schema/react/storeUpdater';
import { WidgetEngine as WidgetEngineBase } from '@ui-schema/react/WidgetEngine';
const WidgetEngine = WidgetEngineBase as ComponentType<any>;

import widgets from './components-form';
import { OrderedMap } from 'immutable';
import { useGetTranslation } from './helpers';
import { SomeSchema } from '@ui-schema/ui-schema';

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
    () =>
      createOrderedMap(schema ?? {}) as SomeSchema & OrderedMap<string, any>,
    [schema],
  );

  if (isEmpty(schema)) return null;

  return (
    <UIMetaProvider binding={widgets as any} t={translator}>
      <UIStoreProvider
        store={uiStore}
        showValidity={true}
        onChange={onChange}
        rootRule={schemaRules}
        editMode={editMode}
      >
        <WidgetEngine isRoot schema={schemaMap} resource={resource} />
      </UIStoreProvider>
    </UIMetaProvider>
  );
}
