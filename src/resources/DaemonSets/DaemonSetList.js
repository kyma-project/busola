import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { Labels } from 'shared/components/Labels/Labels';
import { useRestartAction } from 'shared/hooks/useRestartResource';

import { DaemonSetCreate } from './DaemonSetCreate';
import { DaemonSetStatus } from './DaemonSetStatus';
import { Description } from 'shared/components/Description/Description';
import {
  daemonSetDocsURL,
  daemonSetI18nDescriptionKey,
} from 'resources/DaemonSets/index';

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

  return (
    <ResourcesList
      customColumns={customColumns}
      resourceTitle={t('daemon-sets.title')}
      description={
        <Description
          i18nKey={daemonSetI18nDescriptionKey}
          url={daemonSetDocsURL}
        />
      }
      customListActions={[restartAction]}
      {...props}
      createResourceForm={DaemonSetCreate}
      emptyListProps={{
        subtitleText: t('daemon-sets.description'),
        url:
          'https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/',
      }}
    />
  );
}

export default DaemonSetList;
