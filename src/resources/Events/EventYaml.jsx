import React from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import { showYamlTab } from './index';

export default function EventYaml({
  formElementRef,
  onChange,
  setCustomValid,
  resource: initialEvent,
  resourceUrl,
  ...props
}) {
  return (
    <ResourceForm
      {...props}
      resource={initialEvent}
      initialResource={initialEvent}
      onlyYaml={!!showYamlTab}
    />
  );
}
