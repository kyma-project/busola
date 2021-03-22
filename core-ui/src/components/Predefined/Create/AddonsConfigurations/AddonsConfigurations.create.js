import React from 'react';
import { AddonsConfigurations } from './AddonsConfigurations.js';

export const AddonsConfigurationsCreate = ({
  formElementRef,
  onChange,
  resourceType,
  resourceUrl,
  namespace,
  refetchList,
}) => (
  <AddonsConfigurations
    formElementRef={formElementRef}
    onChange={onChange}
    resourceType={resourceType}
    resourceUrl={resourceUrl}
    namespace={namespace}
    refetchList={refetchList}
  />
);

export const ClusterAddonsConfigurationsCreate = ({
  formElementRef,
  onChange,
  resourceType,
  resourceUrl,
  namespace,
  refetchList,
}) => (
  <AddonsConfigurations
    formElementRef={formElementRef}
    onChange={onChange}
    resourceType={resourceType}
    resourceUrl={resourceUrl}
    namespace={namespace}
    refetchList={refetchList}
  />
);
