import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledByKind } from 'shared/components/ControlledBy/ControlledBy';
import { Link } from 'shared/components/Link/Link';

import { useRestartAction } from 'shared/hooks/useRestartResource';
import { StatefulSetCreate } from './StatefulSetCreate';
import { StatefulSetPods } from './StatefulSetPods';

export function StatefulSetList(props) {
  const { t } = useTranslation();
  const restartAction = useRestartAction(props.resourceUrl);

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
      createResourceForm={StatefulSetCreate}
      {...props}
    />
  );
}
export default StatefulSetList;
