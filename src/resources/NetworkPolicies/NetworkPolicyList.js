import React from 'react';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';

import { NetworkPolicyCreate } from './NetworkPolicyCreate';
import { Description } from 'shared/components/Description/Description';
import {
  networkPoliciesDocsURL,
  networkPoliciesI18nDescriptionKey,
} from 'resources/NetworkPolicies/index';

export function NetworkPolicyList(props) {
  return (
    <ResourcesList
      description={
        <Description
          i18nKey={networkPoliciesI18nDescriptionKey}
          url={networkPoliciesDocsURL}
        />
      }
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
