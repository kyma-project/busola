import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledByKind } from 'react-shared';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

import { StatefulSetPods } from '../Details/StatefulSet/StatefulSetPods';
import { useRestartAction } from 'shared/hooks/useRestartResource';

export const StatefulSetsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const restartAction = useRestartAction(otherParams.resourceUrl);

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: set => (
        <ControlledByKind ownerReferences={set.metadata.ownerReferences} />
      ),
    },
    {
      header: t('common.headers.pods'),
      value: set => <StatefulSetPods key="replicas" set={set} />,
    },
  ];

  const description = (
    <Trans i18nKey="stateful-sets.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      resourceName={t('stateful-sets.title')}
      customColumns={customColumns}
      description={description}
      customListActions={[restartAction]}
      {...otherParams}
    />
  );
};
