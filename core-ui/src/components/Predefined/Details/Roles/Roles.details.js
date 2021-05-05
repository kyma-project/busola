import React from 'react';
import { Rules } from './Rules.js';

export const RolesDetails = ({ DefaultRenderer, ...otherParams }) => {
  return <DefaultRenderer {...otherParams} customComponents={[Rules]} />;
};

export const ClusterRolesDetails = ({ DefaultRenderer, ...otherParams }) => {
  return <DefaultRenderer {...otherParams} customComponents={[Rules]} />;
};
