import React, { useState } from 'react';
import * as jp from 'jsonpath';
import { ResourceForm } from 'shared/ResourceForm';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext } from 'react-shared';
import { createTemplate } from './templates';

function CRCreate({ onChange, formElementRef, crd }) {
  const { namespaceId } = useMicrofrontendContext();
  const [CR, setCR] = useState(createTemplate(namespaceId, crd));

  const createResourceUrl = crd => {
    const currentVersion = crd.spec.versions.find(ver => ver.storage).name;
    const namespace =
      crd.spec.scope === 'Namespaced' ? `/namespaces/${namespaceId}` : '';
    return `/apis/${crd.spec.group}/${currentVersion}${namespace}/${crd.spec.names.plural}`;
  };

  const redirectToResource = (crd, crName) => {
    if (crd.spec.scope === 'Namespaced') {
      LuigiClient.linkManager()
        .fromContext('namespace')
        .navigate(
          `customresourcedefinitions/details/${crd.metadata.name}/${
            crd.spec.versions.find(ver => ver.storage).name
          }/${crName}`,
        );
    } else {
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(
          `customresourcedefinitions/details/${crd.metadata.name}/${
            crd.spec.versions.find(ver => ver.storage).name
          }/${crName}`,
        );
    }
  };

  return (
    <ResourceForm
      pluralKind={crd.spec.names.plural}
      singularName={crd.spec.names.kind}
      resource={CR}
      setResource={setCR}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={createResourceUrl(crd)}
      onlyYaml
      afterCreatedFn={() =>
        redirectToResource(crd, jp.value(CR, '$.metadata.name'))
      }
    />
  );
}

export { CRCreate };
