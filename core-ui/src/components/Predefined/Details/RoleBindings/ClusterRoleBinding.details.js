import React from 'react';

import { RoleBindings } from './RoleBindings.js';

export const ClusterRoleBindingsDetails = DefaultRenderer => ({
  ...otherParams
}) => <DefaultRenderer {...otherParams} customComponents={[RoleBindings]} />;
