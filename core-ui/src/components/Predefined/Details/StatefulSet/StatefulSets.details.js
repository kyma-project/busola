import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourcePods } from '../ResourcePods';
import { StatefulSetReplicas } from './StatefulSetReplicas';

export function StatefulSetsDetails({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  const customColumns = [
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
