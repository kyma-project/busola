import React, { useEffect, useState } from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useGetTranslation } from './helpers';

import { createTemplate } from './helpers';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { prettifyKind } from 'shared/utils/helpers';
import { widgetList } from 'components/Extensibility/components-form';

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
        // const fieldSpec =
        //   createResource.schema.properties.spec.properties
        //     .enableUnsupportedPlugins;
        // const fieldSpec = createResource.schema.properties.kind;
        const fieldSpec =
          createResource.schema.properties.spec.properties.files;

        const Component = widgetList[fieldSpec.type];

        return (
          <Component
            // propertyPath="$.spec.enableUnsupportedPlugins"
            // propertyPath="$.kind"
            propertyPath="$.spec.files"
            componentSpec={el}
            schema={createResource.schema}
          />
        );
      })}
    </ResourceForm>
  );
}

ExtensibilityCreate.allowEdit = false;
