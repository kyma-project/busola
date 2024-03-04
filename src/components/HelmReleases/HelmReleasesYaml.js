import React from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import { showYamlTab } from './index';

export default function HelmReleasesYaml({
  formElementRef,
  onChange,
  setCustomValid,
  resource: initialHelmRelease,
  resourceUrl,
  ...props
}) {
  console.log('HelmReleasesYaml', showYamlTab);
  return (
    <ResourceForm
      {...props}
      resource={initialHelmRelease}
      initialResource={initialHelmRelease}
      onlyYaml={!!showYamlTab}
    />
  );
}
