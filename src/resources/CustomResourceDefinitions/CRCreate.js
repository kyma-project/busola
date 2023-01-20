import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ResourceForm } from 'shared/ResourceForm';
import { useCustomResourceUrl } from 'resources/CustomResourceDefinitions/useCustomResourceUrl';

import { createTemplate } from './templates';

function CRCreate({ onChange, formElementRef, crd, toggleFormFn }) {
  const [cr, setCr] = useState(createTemplate(crd));
  const customUrl = useCustomResourceUrl(crd);
  const navigate = useNavigate();

  const currentVersion = crd.spec.versions.find(ver => ver.storage).name;
  const namespace =
    crd.spec.scope === 'Namespaced'
      ? `/namespaces/${cr.metadata?.namespace || ''}`
      : '';
  const createUrl = `/apis/${crd.spec?.group ||
    ''}/${currentVersion}${namespace}/${crd.spec.names.plural}`;

  return (
    <ResourceForm
      pluralKind={crd.spec.names.plural}
      singularName={crd.spec.names.kind}
      resource={cr}
      setResource={setCr}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={createUrl}
      onlyYaml
      afterCreatedFn={() => {
        navigate(customUrl(cr));
        toggleFormFn();
      }}
    />
  );
}

export { CRCreate };
