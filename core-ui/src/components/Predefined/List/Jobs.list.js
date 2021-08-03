import React from 'react';
// import { PodStatus } from '../../Details/Pod/PodStatus';
// import PodRestarts from './PodRestarts';

export const JobsList = ({ DefaultRenderer, ...otherParams }) => {
  // const customColumns = [
  // {
  // header: 'Status',
  // value: pod => <PodStatus pod={pod} />,
  // },
  // {
  // header: 'Restarts',
  // value: pod => <PodRestarts statuses={pod.status.containerStatuses} />,
  // },
  // ];

  return <DefaultRenderer {...otherParams} />;
};
