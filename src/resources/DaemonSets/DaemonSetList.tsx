import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { Labels } from 'shared/components/Labels/Labels';
import { useRestartAction } from 'shared/hooks/useRestartResource';
import { Resource } from 'components/Extensibility/contexts/DataSources';

import DaemonSetCreate from './DaemonSetCreate';
import { DaemonSetStatus, DaemonSetType } from './DaemonSetStatus';
import {
  ResourceDescription,
  i18nDescriptionKey,
  docsURL,
} from 'resources/DaemonSets';

interface DaemonSetProps {
  namespace: string;
  resourceUrl: string;
  resourceType: string;
  [key: string]: any;
}

export function DaemonSetList(props: DaemonSetProps) {
  const { t } = useTranslation();
  const restartAction = useRestartAction(props.resourceUrl);

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: (resource: Resource) => (
        <ControlledBy
          ownerReferences={resource.metadata.ownerReferences}
          kindOnly
        />
      ),
    },
    {
      header: t('daemon-sets.node-selector'),
      value: (resource: Resource) => (
        <Labels labels={resource.spec.template.spec.nodeSelector} />
      ),
    },
    {
      header: t('common.headers.pods'),
      value: (resource: DaemonSetType) => (
        <DaemonSetStatus daemonSet={resource} />
      ),
    },
  ];

  return (
    <ResourcesList
      customColumns={customColumns}
      resourceTitle={t('daemon-sets.title')}
      description={ResourceDescription}
      customListActions={[restartAction]}
      {...props}
      createResourceForm={DaemonSetCreate}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
    />
  );
}

export default DaemonSetList;
