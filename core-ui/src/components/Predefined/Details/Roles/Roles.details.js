import React from 'react';
import { Rules } from './Rules.js';

import './RolesDetails.scss';

function GenericRoleDetails({ DefaultRenderer, ...otherParams }) {
  return <DefaultRenderer {...otherParams} customComponents={[Rules]} />;
}

export const RolesDetails = GenericRoleDetails;
export const ClusterRolesDetails = GenericRoleDetails;
