import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledBy } from 'react-shared';

import { ResourcePods } from '../ResourcePods';
import { StatefulSetReplicas } from './StatefulSetReplicas';

export function StatefulSetsDetails({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: set => (
        <ControlledBy ownerReferences={set.metadata.ownerReferences} />
      ),
    },
    {
      header: t('stateful-sets.replicas'),
      value: set => <StatefulSetReplicas key="replicas" set={set} />,
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[ResourcePods]}
      {...otherParams}
    ></DefaultRenderer>
  );
}
