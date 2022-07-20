import React, { useEffect, useState } from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useGetTranslation } from './helpers';

import { createTemplate } from './helpers';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { prettifyKind } from 'shared/utils/helpers';
import { widgetList } from 'components/Extensibility/components-form';

const handleAllAnyOneOf = ({ schema, path, kind = 'allOf' }) => {
  const currentPath = path?.split('.')?.[0];
  let sub;
  schema?.[kind]?.forEach(subSchema => {
    if (subSchema.type === 'object' && subSchema.properties) {
      const keys = Object.keys(subSchema.properties) || [];
      const wantedKey = keys.find(key => key === currentPath);
      if (wantedKey) sub = subSchema.properties[wantedKey];
      return;
    }
    return;
  });
  return sub || { type: 'string' };
};

export const getSubSchema = ({ schema, path }) => {
  const currentPath = path?.split('.')?.[0];
  const newPath = path.replace(`${currentPath}.`, '');
  if (!schema?.[currentPath] || !path) return schema;
  if (schema[currentPath].type === 'object' && schema[currentPath].properties) {
    const newSchema = schema[currentPath].properties;
    return getSubSchema({ schema: newSchema, path: newPath });
  }
  if (schema[currentPath].allOf) {
    return handleAllAnyOneOf({
      schema: schema[currentPath],
      path: newPath,
      kind: 'allOf',
    });
  }

  if (schema[currentPath].anyOf) {
    return handleAllAnyOneOf({
      schema: schema[currentPath],
      path: newPath,
      kind: 'anyOf',
    });
  }

  if (schema[currentPath].oneOf) {
    return handleAllAnyOneOf({
      schema: schema[currentPath],
      path: newPath,
      kind: 'oneOf',
    });
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
