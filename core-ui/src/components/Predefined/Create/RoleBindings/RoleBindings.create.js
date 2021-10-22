import React from 'react';
import { RoleBindings as OldRoleBindings } from './OldRoleBindings.js';
import { RoleBindings } from './RoleBindings.js';

export const RoleBindingsCreate = props => <RoleBindings {...props} />;

export const ClusterRoleBindingsCreate = props => <RoleBindings {...props} />;
