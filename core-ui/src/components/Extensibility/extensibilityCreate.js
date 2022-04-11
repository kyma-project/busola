import React, { useState } from 'react';
import { ResourceForm } from 'shared/ResourceForm';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { Spinner } from 'shared/components/Spinner/Spinner';

export function ExtensibilityCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceType,
  resourceUrl,
  resource: createResource,
}) {
  const api = createResource?.nav?.resource;
  const [resource, setResource] = useState({});
  const { data, loading = true } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions/${api.kind}.${api.group}`,
  );
  if (loading) return <Spinner />;

  const versions = data?.spec?.versions || [];
  const schema = versions.find(v => v.name === api.version)?.schema || {};
  console.log(schema);

  return (
    <ResourceForm
      pluralKind={resourceType}
      singularName={resourceType}
      resource={resource}
      setResource={setResource}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
