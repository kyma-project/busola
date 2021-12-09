import React from 'react';
import { ControlledBy, StatusBadge } from 'react-shared';

import { ResourcePods } from './ResourcePods';
import { useTranslation } from 'react-i18next';

export const ReplicasetsDetails = ({ DefaultRenderer, ...otherParams }) => {
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
      header: t('replica-sets.headers.replicas'),
      value: ({ status: { replicas, readyReplicas } }) => {
        const type = (readyReplicas || 0) < replicas ? 'warning' : 'success';
        const content = `${readyReplicas || 0} / ${replicas}`;
        return (
          <StatusBadge noTooltip key="replicas" type={type}>
            {content}
          </StatusBadge>
        );
      },
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[ResourcePods]}
      {...otherParams}
    ></DefaultRenderer>
  );
};
