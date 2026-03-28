import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';

import NetworkPolicyCreate from './NetworkPolicyCreate';
import {
  docsURL,
  i18nDescriptionKey,
  ResourceDescription,
} from 'resources/NetworkPolicies';
import { ResourcesListProps } from 'shared/components/ResourcesList/types';

export function NetworkPolicyList(props: ResourcesListProps) {
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
