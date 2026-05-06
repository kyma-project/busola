import { ComponentType, RefObject, useMemo, useState } from 'react';
import { UIMetaProvider } from '@ui-schema/react/UIMeta';
import { UIStoreProvider, createStore } from '@ui-schema/react/UIStore';
import { storeUpdater } from '@ui-schema/react/storeUpdater';
import { WidgetEngine as WidgetEngineBase } from '@ui-schema/react/WidgetEngine';
const WidgetEngine = WidgetEngineBase as ComponentType<any>;
import { createOrderedMap } from '@ui-schema/ui-schema/createMap';
import jsyaml from 'js-yaml';
import { fromJS } from 'immutable';

import { ResourceForm } from 'shared/ResourceForm';
import { limitedWidgets } from 'components/Extensibility/components-form';
import { getResourceObjFromUIStore } from 'components/Extensibility/helpers/immutableConverter';
import { useTranslation } from 'react-i18next';

type SectionEditorProps = {
  data: string;
  schema: Record<string, any>;
  onlyYaml?: boolean;
  formElementRef?: RefObject<HTMLFormElement | null>;
  onSubmit: (yamlData: string) => void;
};

export function SectionEditor({
  data,
  schema,
  onlyYaml,
  formElementRef,
  onSubmit,
}: SectionEditorProps) {
  const { t } = useTranslation();
  const [store, setStore] = useState(() =>
    createStore(fromJS(jsyaml.load(data))),
  );
  const resource = useMemo(() => getResourceObjFromUIStore(store), [store]);
  const schemaMap = useMemo(() => createOrderedMap(schema), [schema]);
  const [initialResource] = useState(resource);

  const onChange = (actions: any) => {
    setStore((prevStore) => storeUpdater(actions)(prevStore));
  };

  return (
    <UIMetaProvider binding={limitedWidgets as any} t={(key) => t(key)}>
      <UIStoreProvider store={store} showValidity={true} onChange={onChange}>
        <ResourceForm
          resource={resource}
          initialResource={initialResource}
          disableDefaultFields
          onlyYaml={onlyYaml}
          formElementRef={formElementRef}
          onSubmit={() => onSubmit(jsyaml.dump(resource))}
          setResource={() => {}}
        >
          <WidgetEngine isRoot schema={schemaMap} resource={resource} />
        </ResourceForm>
      </UIStoreProvider>
    </UIMetaProvider>
  );
}
