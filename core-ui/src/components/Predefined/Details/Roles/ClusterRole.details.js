import React from 'react';
import { Rules } from './Rules.js';

export const ClusterRolesDetails = DefaultRenderer => ({ ...otherParams }) => {
  return <DefaultRenderer {...otherParams} customComponents={[Rules]} />;
};
