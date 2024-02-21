import { Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';

import { NetworkPolicyCreate } from './NetworkPolicyCreate';

export function NetworkPolicyList(props) {
  const description = (
    <Trans i18nKey="network-policies.description">
      <ExternalLink
        className="bsl-link"
        url="https://kubernetes.io/docs/concepts/services-networking/network-policies/"
      />
    </Trans>
  );

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
