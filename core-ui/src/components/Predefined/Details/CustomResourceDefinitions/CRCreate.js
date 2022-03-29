import React, { useState } from 'react';
import { ResourceForm } from 'shared/ResourceForm';
import { createTemplate } from './templates';
import { useNavigateToCustomResource } from './useNavigateToCustomResource';

function CRCreate({ onChange, formElementRef, crd }) {
  const [CR, setCR] = useState(createTemplate(crd));
  const navigateToCustomResource = useNavigateToCustomResource();

  const createResourceUrl = (cr, crd) => {
    const currentVersion = crd.spec.versions.find(ver => ver.storage).name;
    const namespace =
      crd.spec.scope === 'Namespaced'
        ? `/namespaces/${cr.metadata.namespace}`
        : '';
    return `/apis/${crd.spec.group}/${currentVersion}${namespace}/${crd.spec.names.plural}`;
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
      afterCreatedFn={() => navigateToCustomResource(CR, crd)}
    />
  );
}

export { CRCreate };
