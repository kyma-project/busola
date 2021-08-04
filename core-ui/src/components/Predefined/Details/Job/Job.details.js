import React from 'react';

import { ResourcePods } from './ResourcePods.js';

export function JobsDetails({ DefaultRenderer, ...otherParams }) {
  const customColumns = [
    {
      header: 'Status',
      value: job => 'abc',
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[ResourcePods]}
      {...otherParams}
    ></DefaultRenderer>
  );
}
