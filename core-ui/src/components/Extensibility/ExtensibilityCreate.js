import React, { useState } from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useGetTranslation } from './helpers';

import { createTemplate } from './helpers';
import { ResourceSchema } from './ResourceSchema';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { prettifyKind } from 'shared/utils/helpers';

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

  const [resource, setResource] = useState(
    initialResource ||
      createResource?.template ||
      createTemplate(api, namespace, createResource?.navigation?.scope),
  );

  //TODO filter schema based on form configuration
  const schema = createResource?.schema;

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
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml={!schema}
      initialResource={initialResource}
      afterCreatedFn={afterCreatedFn}
    >
      <ResourceSchema
        simple
        key={api.version}
        schema={schema || {}}
        schemaRules={createResource?.form}
        resource={resource}
        setResource={setResource}
        onSubmit={() => {}}
        path={createResource?.navigation?.path || ''}
      />
      <ResourceSchema
        advanced
        key={api.version}
        schema={schema || {}}
        schemaRules={createResource?.form}
        resource={resource}
        setResource={setResource}
        path={createResource?.navigation?.path || ''}
      />
    </ResourceForm>
  );
}

ExtensibilityCreate.allowEdit = true;
