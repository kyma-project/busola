import React from 'react';
import { DeploymentPods } from './DeploymentPods.js';

export const DeploymentsDetails = ({ DefaultRenderer, ...otherParams }) => {
  return (
    <DefaultRenderer
      customComponents={[DeploymentPods]}
      {...otherParams}
    ></DefaultRenderer>
  );
};
