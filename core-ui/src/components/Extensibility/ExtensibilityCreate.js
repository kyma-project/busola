import React, { useEffect, useState } from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useGetTranslation } from './helpers';

import { createTemplate } from './helpers';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { prettifyKind } from 'shared/utils/helpers';
import { widgetList } from 'components/Extensibility/components-form';

export const getSubSchema = ({ schema, path }) => {
  const currentPath = path?.split('.')?.[0];
  if (!schema?.[currentPath] || !path) return schema;
  if (schema[currentPath].type === 'object' && schema[currentPath].properties) {
    const newSchema = schema[currentPath].properties;
    const newPath = path.replace(`${currentPath}.`, '');
    return getSubSchema({ schema: newSchema, path: newPath });
  }
  return schema[currentPath];
};
export function ExtensibilityCreate({
  formElementRef,
  setCustomValid,
  resourceType,
  resourceUrl,
  resource: initialResource,
  resourceSchema: createResource,
  toggleFormFn,
  resourceName,
}) {
  const { namespaceId: namespace } = useMicrofrontendContext();
  const notification = useNotification();
  const { t } = useTranslation();
  const { t: tExt, exists } = useGetTranslation();
  const api = createResource?.resource || {};
  const schema = createResource?.schema;

  const [resource, setResource] = useState(
    initialResource ||
      createResource?.template ||
      createTemplate(api, namespace, createResource?.resource?.scope),
  );
  // const [store, setStore] = useState(() =>
  //   createStore(createOrderedMap(resource)),
  // );
  //
  // const updateResource = res =>
  //   setStore(prevStore => prevStore.set('values', Immutable.fromJS(res)));

  //TODO filter schema based on form configuration

  // useEffect(() => {
  //   setResource(store.valuesToJS());
  // }, [store.values]); // eslint-disable-line react-hooks/exhaustive-deps

  const afterCreatedFn = async defaultAfterCreatedFn => {
    if (createResource?.details) {
      defaultAfterCreatedFn();
    } else {
      notification.notifySuccess({
        content: t(
          initialResource
            ? 'common.create-form.messages.patch-success'
            : 'common.create-form.messages.create-success',
          {
            resourceType: resourceName,
          },
        ),
      });
    }
    toggleFormFn(false);
  };

  return (
    <ResourceForm
      pluralKind={resourceType}
      singularName={
        exists('name')
          ? tExt('name')
          : prettifyKind(createResource.resource?.kind || '')
      }
      resource={resource}
      setResource={setResource}
      onChange={() => {}}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      // setCustomValid={setCustomValid}
      onlyYaml={!schema}
      initialResource={initialResource}
      afterCreatedFn={afterCreatedFn}
    >
      {createResource?.form?.map(el => {
        const fieldSpec = getSubSchema({
          schema: createResource.schema.properties,
          path: el.path,
        });
        const Component = widgetList[fieldSpec.type];

        return (
          <Component
            propertyPath={el.path}
            componentSpec={el}
            schema={createResource.schema}
            currentSchema={fieldSpec}
          />
        );
      })}
    </ResourceForm>
  );
}

ExtensibilityCreate.allowEdit = false;
