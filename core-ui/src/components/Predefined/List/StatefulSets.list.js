import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledByKind } from 'react-shared';
import { Link } from 'react-shared';

import { StatefulSetReplicas } from '../Details/StatefulSet/StatefulSetReplicas';

export const StatefulSetsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: set => (
        <ControlledByKind ownerReferences={set.metadata.ownerReferences} />
      ),
    },
    {
      header: t('stateful-sets.replicas'),
      value: set => <StatefulSetReplicas key="replicas" set={set} />,
    },
  ];

  const description = (
    <span>
      <Link
        className="fd-link fd-link"
        url="https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/"
        text="StatefulSet"
      />
      {t('stateful-sets.description')}
    </span>
  );

  return (
    <DefaultRenderer
      resourceName={t('stateful-sets.title')}
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
};
