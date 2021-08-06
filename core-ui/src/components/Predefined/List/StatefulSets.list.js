import React from 'react';
import { useTranslation } from 'react-i18next';

import { StatefulSetReplicas } from '../Details/StatefulSet/StatefulSetReplicas';

export const StatefulSetsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('stateful-sets.replicas'),
      value: set => <StatefulSetReplicas key="replicas" set={set} />,
    },
  ];

  return (
    <DefaultRenderer
      resourceName={t('stateful-sets.title')}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
