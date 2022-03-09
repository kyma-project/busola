import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledByKind, ResourcesList } from 'react-shared';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

import { StatefulSetPods } from '../Details/StatefulSet/StatefulSetPods';
import { useRestartAction } from 'shared/hooks/useRestartResource';

import { usePrepareListProps } from 'routing/common';
import { StatefulSetsCreate } from '../Create/StatefulSets/StatefulSets.create';

export const StatefulSetsList = () => {
  const params = usePrepareListProps('StatefulSets');
  const { t } = useTranslation();
  const restartAction = useRestartAction(params.resourceUrl);

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
    <ResourcesList
      resourceName={t('stateful-sets.title')}
      customColumns={customColumns}
      description={description}
      customListActions={[restartAction]}
      createResourceForm={StatefulSetsCreate}
      {...params}
    />
  );
};
export default StatefulSetsList;
