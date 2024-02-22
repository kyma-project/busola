import React from 'react';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';

import { NetworkPolicyCreate } from './NetworkPolicyCreate';
import {
  ResourceDescription,
  i18nDescriptionKey,
  docsURL,
} from 'resources/NetworkPolicies/index';

export function NetworkPolicyList(props) {
  return (
    <ResourcesList
      description={ResourceDescription}
      {...props}
      createResourceForm={NetworkPolicyCreate}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
    />
  );
}

export default NetworkPolicyList;
