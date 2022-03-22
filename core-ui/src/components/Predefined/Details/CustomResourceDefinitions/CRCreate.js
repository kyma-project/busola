import React, { useState } from 'react';
import * as jp from 'jsonpath';
import { ResourceForm } from 'shared/ResourceForm';
import LuigiClient from '@luigi-project/client';
import { createTemplate } from './templates';

function CRCreate({ onChange, formElementRef, crd }) {
  const [CR, setCR] = useState(createTemplate(crd));

  const createResourceUrl = (cr, crd) => {
    const currentVersion = crd.spec.versions.find(ver => ver.storage).name;
    const namespace =
      crd.spec.scope === 'Namespaced'
        ? `/namespaces/${cr.metadata.namespace}`
        : '';
    return `/apis/${crd.spec.group}/${currentVersion}${namespace}/${crd.spec.names.plural}`;
  };

  const redirectToResource = (cr, crd) => {
    const crName = jp.value(CR, '$.metadata.name');
    const version = crd.spec.versions.find(ver => ver.storage).name;

    if (crd.spec.scope === 'Namespaced') {
      //todo
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(
          `namespaces/${jp.value(
            CR,
            '$.metadata.namespace',
          )}/customresources/details/${crd.metadata.name}/${version}/${crName}`,
        );
    } else {
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(
          `customresources/details/${cr.metadata.name}/${version}/${crName}`,
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
      createUrl={createResourceUrl(CR, crd)}
      onlyYaml
      afterCreatedFn={() => redirectToResource(CR, crd)}
    />
  );
}

export { CRCreate };
