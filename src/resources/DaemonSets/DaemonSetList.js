import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { Labels } from 'shared/components/Labels/Labels';
import { Link } from 'shared/components/Link/Link';
import { useRestartAction } from 'shared/hooks/useRestartResource';

import { DaemonSetCreate } from './DaemonSetCreate';
import { DaemonSetStatus } from './DaemonSetStatus';

export function DaemonSetList(props) {
  const { t } = useTranslation();
  const restartAction = useRestartAction(props.resourceUrl);

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: resource => (
        <ControlledBy
          ownerReferences={resource.metadata.ownerReferences}
          kindOnly
        />
      ),
    },
    {
      header: t('daemon-sets.node-selector'),
      value: resource => (
        <Labels
          labels={resource.spec.template.spec.nodeSelector}
          shortenLongLabels
        />
      ),
    },
    {
      header: t('common.headers.pods'),
      value: resource => <DaemonSetStatus daemonSet={resource} />,
    },
  ];

  const description = (
    <Trans i18nKey="daemon-sets.description">
      <Link
        className="bsl-link"
        url="https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      resourceTitle={t('daemon-sets.title')}
      description={description}
      customListActions={[restartAction]}
      {...props}
      createResourceForm={DaemonSetCreate}
    />
  );
}
export default DaemonSetList;
