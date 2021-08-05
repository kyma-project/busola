import React from 'react';

import { ResourcePods } from './ResourcePods.js';

export const DeploymentsDetails = ({ DefaultRenderer, ...otherParams }) => {
  return (
    <DefaultRenderer
      customComponents={[ResourcePods]}
      {...otherParams}
    ></DefaultRenderer>
  );
};
