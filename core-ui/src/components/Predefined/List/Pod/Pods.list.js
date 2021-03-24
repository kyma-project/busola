import React from 'react';
import { PodStatus } from '../../Details/Pod/PodStatus';
import PodRestarts from './PodRestarts';

export const PodsList = DefaultRenderer => ({ ...otherParams }) => {
  const customColumns = [
    {
      header: 'Status',
      value: pod => <PodStatus pod={pod} />,
    },
    {
      header: 'Restarts',
      value: pod => <PodRestarts statuses={pod.status.containerStatuses} />,
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};
