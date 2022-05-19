import React from 'react';
import { TransTitle } from '@ui-schema/ui-schema/Translate/TransTitle';

import { ResourceForm } from 'shared/ResourceForm';
import { KeyValueField } from 'shared/ResourceForm/fields';

export function KeyValuePairRenderer({
  storeKeys,
  schema,
  resource,
  setResource,
}) {
  const propertyPath = `$.${storeKeys.toJS().join('.')}`;

  return (
    <ResourceForm.Wrapper resource={resource} setResource={setResource}>
      <KeyValueField
        propertyPath={propertyPath}
        title={<TransTitle schema={schema} storeKeys={storeKeys} />}
      />
    </ResourceForm.Wrapper>
  );
}
