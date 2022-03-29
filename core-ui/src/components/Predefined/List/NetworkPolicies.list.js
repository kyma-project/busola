import React from 'react';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
import { Trans } from 'react-i18next';
import { NetworkPoliciesCreate } from '../Create/NetworkPolicies/NetworkPolicies.create';

const NetworkPoliciesList = props => {
  const description = (
    <Trans i18nKey="network-policies.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/services-networking/network-policies/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      description={description}
      createResourceForm={NetworkPoliciesCreate}
      {...props}
    />
  );
};

export default NetworkPoliciesList;
