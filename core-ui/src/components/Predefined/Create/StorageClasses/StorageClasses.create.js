import React, { useState } from 'react';
import { ResourceForm } from 'shared/ResourceForm';
import { createStorageClassTemplate } from './templates';

const StorageClassesCreate = ({
  onChange,
  formElementRef,
  resourceUrl,
  setCustomValid,
}) => {
  const [storageClass, setStorageClass] = useState(
    createStorageClassTemplate(),
  );

  return (
    <ResourceForm
      pluralKind="storageclass"
      resource={storageClass}
      setResource={setStorageClass}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    ></ResourceForm>
  );
};
export { StorageClassesCreate };
