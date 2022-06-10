import React, { useState } from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

import { createTemplate } from './helpers';
import { ResourceSchema } from './ResourceSchema';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

export function ExtensibilityCreate({
  formElementRef,
  setCustomValid,
  resourceType,
  resourceUrl,
  resource: createResource,
  toggleFormFn,
  ...props
}) {
  const { namespaceId: namespace } = useMicrofrontendContext();
  const notification = useNotification();
  const { t } = useTranslation();
  const api = createResource?.resource || {};

  const [resource, setResource] = useState(
    createResource?.template ||
      createTemplate(api, namespace, createResource?.navigation?.scope),
  );

  //TODO filter schema based on form configuration
  const schema = createResource?.schema;

  console.log('props', props);
  const afterCreatedFn = async defaultAfterCreatedFn => {
    console.log('api', api);
    console.log('createres', createResource);
    if (createResource?.details) {
      defaultAfterCreatedFn();
    } else {
      toggleFormFn(false);
      notification.notifySuccess({
        content: t(
          !props?.item //how to check if it is edit/create mode
            ? 'common.create-form.messages.patch-success'
            : 'common.create-form.messages.create-success',
          {
            resourceType: api?.kind,
          },
        ),
      });
    }
  };

  return (
    <ResourceForm
      pluralKind={resourceType}
      singularName={api?.kind}
      resource={resource}
      setResource={setResource}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml={!schema}
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
