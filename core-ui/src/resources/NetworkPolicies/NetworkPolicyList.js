import React from 'react';
import { Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ExternalLink } from 'shared/components/Link/ExternalLink';

import { NetworkPolicyCreate } from './NetworkPolicyCreate';

export function NetworkPolicyList(props) {
  const description = (
    <Trans i18nKey="network-policies.description">
      <ExternalLink
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/services-networking/network-policies/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      description={description}
      createResourceForm={NetworkPolicyCreate}
      {...props}
    />
  );
}

export default NetworkPolicyList;
