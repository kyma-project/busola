import React, { useState, useRef } from 'react';
import { isEmpty, isEqual } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import ResourceSchema from './components/ResourceSchema';

export function ExtensibilityCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceType,
  resourceUrl,
  resource: createResource,
}) {
  const api = createResource?.nav?.resource || {};
  const jsonSchemaFormRef = useRef(null);

  const [resource, setResource] = useState({
    apiVersion: `${api.group}/${api.version}`,
    kind: api.kind,
    metadata: {
      name: '',
      labels: {},
      annotations: {},
    },
    spec: {},
  });

  const parametersSchema = createResource?.create?.openAPIV3Schema;

  const {
    data,
  } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions/${api.kind.toLowerCase()}.${
      api.group
    }`,
    { skip: !isEmpty(parametersSchema) },
  );

  const versions = data?.spec?.versions || [];
  const schema = !isEmpty(parametersSchema)
    ? parametersSchema
    : versions.find(v => v.name === api.version)?.schema?.openAPIV3Schema || {};

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
    >
      <ResourceSchema
        key={api.version}
        schemaFormRef={jsonSchemaFormRef}
        data={schema || {}}
        instanceCreateParameterSchema={schema}
        onSubmitSchemaForm={() => {}}
        onFormChange={formData => {
          onChange(formData);
          // if (
          //   !isEqual(formData?.spec, resource?.spec)
          // ) {
          // const newResource = formData?.spec || {};
          // delete newResource?.properties;
          // delete newResource?.type;
          // setResource(newResource);
          // }
        }}
      />
    </ResourceForm>
  );
}
