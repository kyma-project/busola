import React from 'react';
import { RoleBindings } from './RoleBindings.js';

export const RoleBindingsCreate = ({
  formElementRef,
  onChange,
  resourceType,
  resourceUrl,
  namespace,
  refetchList,
}) => (
  <RoleBindings
    formElementRef={formElementRef}
    onChange={onChange}
    resourceType={resourceType}
    resourceUrl={resourceUrl}
    namespace={namespace}
    refetchList={refetchList}
  />
);

export const ClusterRoleBindingsCreate = ({
  formElementRef,
  onChange,
  resourceType,
  resourceUrl,
  namespace,
  refetchList,
}) => (
  <RoleBindings
    formElementRef={formElementRef}
    onChange={onChange}
    resourceType={resourceType}
    resourceUrl={resourceUrl}
    namespace={namespace}
    refetchList={refetchList}
  />
);
