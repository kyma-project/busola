import React from 'react';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';

import { NetworkPolicyCreate } from './NetworkPolicyCreate';
import { description } from './NetoworkPolicyDescription';

export function NetworkPolicyList(props) {
  return (
    <ResourcesList
      description={description}
      {...props}
      createResourceForm={NetworkPolicyCreate}
      emptyListProps={{
        subtitleText: 'network-policies.description',
        url:
          'https://kubernetes.io/docs/concepts/services-networking/network-policies/',
      }}
    />
  );
}

export default NetworkPolicyList;
