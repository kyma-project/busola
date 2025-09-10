import React from 'react';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';

export function GenericRoleList({
  description,
  descriptionKey,
  ...otherParams
}) {
  return (
    <ResourcesList
      description={description}
      {...otherParams}
      emptyListProps={{
        subtitleText: descriptionKey,
        url:
          'https://kyma-project.io/docs/kyma/latest/04-operation-guides/security/sec-02-authorization-in-kyma/#user-authorization',
      }}
    />
  );
}
