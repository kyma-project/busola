import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledByKind } from 'shared/components/ControlledBy/ControlledBy';
import { Labels } from 'shared/components/Labels/Labels';
import { ExternalLink } from 'shared/components/Link/ExternalLink';
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
      <ExternalLink
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
      createResourceForm={DaemonSetCreate}
      {...props}
    />
  );
}
export default DaemonSetList;
