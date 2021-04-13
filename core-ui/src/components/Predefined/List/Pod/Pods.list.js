import React, { useEffect } from 'react';
import { PodStatus } from '../../Details/Pod/PodStatus';
import PodRestarts from './PodRestarts';
import { ResourcesList } from 'react-shared';

export const PodsList = ({ ...otherParams }) => {
  // console.log('PodList render');
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

  return <ResourcesList customColumns={customColumns} {...otherParams} />;
};
