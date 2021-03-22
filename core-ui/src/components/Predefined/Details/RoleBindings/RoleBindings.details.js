import React from 'react';

import { RoleBindings } from './RoleBindings.js';

export const RoleBindingsDetails = DefaultRenderer => ({ ...otherParams }) => (
  <DefaultRenderer {...otherParams} customComponents={[RoleBindings]} />
);

export const ClusterRoleBindingsDetails = DefaultRenderer => ({
  ...otherParams
}) => <DefaultRenderer {...otherParams} customComponents={[RoleBindings]} />;
