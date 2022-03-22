import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledByKind, Labels, Link, ResourcesList } from 'react-shared';
import { Trans } from 'react-i18next';
import { DaemonSetsCreate } from '../Create/DaemonSets/DaemonSets.create';
import { DaemonSetStatus } from '../Details/DaemonSet/DaemonSetStatus';
import { useRestartAction } from 'shared/hooks/useRestartResource';

const DaemonSetsList = props => {
  const { t } = useTranslation();
  const restartAction = useRestartAction(props.resourceUrl);

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: resource => (
        <ControlledByKind ownerReferences={resource.metadata.ownerReferences} />
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
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      resourceName={t('daemon-sets.title')}
      description={description}
      customListActions={[restartAction]}
      createResourceForm={DaemonSetsCreate}
      {...props}
    />
  );
};
export default DaemonSetsList;
