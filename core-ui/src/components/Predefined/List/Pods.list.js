import React from 'react';
import { PodStatus } from '../Details/Pod/PodStatus';

export const PodsList = DefaultRenderer => ({ ...otherParams }) => {
  const customColumns = [
    {
      header: 'Status',
      value: pod => <PodStatus pod={pod} />,
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};
