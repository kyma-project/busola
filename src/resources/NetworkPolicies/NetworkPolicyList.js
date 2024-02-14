import React from 'react';
import { Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';

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
