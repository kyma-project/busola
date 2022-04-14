import React from 'react';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { useTranslation } from 'react-i18next';

import { ReplicaSetStatus } from './ReplicaSetStatus';
import { HPASubcomponent } from '../HPA/HPASubcomponent';
import { Selector } from 'shared/components/Selector/Selector';
import { ReplicaSetsCreate } from '../../Create/ReplicaSets/ReplicaSets.create';

export const ReplicasetsDetails = props => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: resource => (
        <ControlledBy ownerReferences={resource.metadata.ownerReferences} />
      ),
    },
    {
      header: t('replica-sets.headers.limits'),
      value: resource => {
        const containers = resource.spec.template.spec.containers || [];
        return (
          <React.Fragment key="limits">
            {containers.map(c => (
              <React.Fragment key={c.name}>
                {t('replica-sets.cpu')}: {c.resources?.limits?.cpu}
                <br />
                {t('replica-sets.memory')}: {c.resources?.limits?.memory}
                <br />
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      },
    },
    {
      header: t('replica-sets.headers.requests'),
      value: resource => {
        const containers = resource.spec.template.spec.containers || [];
        return (
          <React.Fragment key="requests">
            {containers.map(c => (
              <React.Fragment key={c.name}>
                {t('replica-sets.cpu')}: {c.resources?.requests?.cpu}
                <br />
                {t('replica-sets.memory')}: {c.resources?.requests?.memory}
                <br />
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      },
    },
    {
      header: t('common.headers.pods'),
      value: resource => <ReplicaSetStatus replicaSet={resource} />,
    },
  ];

  const MatchSelector = replicaset => (
    <Selector
      namespace={replicaset.metadata.namespace}
      labels={replicaset.spec?.selector?.matchLabels}
      expressions={replicaset.spec?.selector?.matchExpressions}
      selector={replicaset.spec?.selector}
    />
  );

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={[HPASubcomponent, MatchSelector]}
      createResourceForm={ReplicaSetsCreate}
      {...props}
    />
  );
};
export default ReplicasetsDetails;
