import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { usePrepareLayout } from 'shared/hooks/usePrepareLayout';

import { useCustomResourceUrl } from 'resources/CustomResourceDefinitions/useCustomResourceUrl';

import { createTemplate } from './templates';

function CRCreate({
  onChange,
  formElementRef,
  crd,
  layoutNumber,
  resource: initialCustomResource,
  ...props
}) {
  const [cr, setCr] = useState(
    cloneDeep(initialCustomResource) || createTemplate(crd),
  );
  const [initialUnchangedResource] = useState(initialCustomResource);
  const currUrl = window.location.href;

  const customUrl = useCustomResourceUrl(
    crd,
    currUrl.includes('customresources/'),
  );

  const navigate = useNavigate();
  const { nextQuery, currentQuery } = usePrepareLayout(layoutNumber);
  const goToLayoutQuery = customUrl(cr).includes('customresources/')
    ? nextQuery
    : currentQuery;

  const currentVersion = crd.spec.versions.find(ver => ver.storage).name;
  const namespace =
    crd.spec.scope === 'Namespaced'
      ? `/namespaces/${cr.metadata?.namespace || ''}`
      : '';
  const createUrlResourceName = !!initialCustomResource?.metadata?.name
    ? '/' + initialCustomResource.metadata.name
    : '';

  const createUrl = `/apis/${crd.spec?.group ||
    ''}/${currentVersion}${namespace}/${
    crd.spec.names.plural
  }${createUrlResourceName}`;

  if (!initialCustomResource) {
    initialCustomResource = createTemplate(crd);
  }

  return (
    <ResourceForm
      {...props}
      pluralKind={crd.spec.names.plural}
      singularName={crd.spec.names.kind}
      resource={cr}
      initialResource={initialCustomResource}
      initialUnchangedResource={initialUnchangedResource}
      setResource={setCr}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={createUrl}
      onlyYaml
      layoutNumber={layoutNumber}
      afterCreatedFn={() => {
        navigate(`${customUrl(cr)}${goToLayoutQuery}`);
      }}
    />
  );
}

export default CRCreate;
