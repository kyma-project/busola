import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import {
  ControlledBy,
  OwnerReferences,
} from 'shared/components/ControlledBy/ControlledBy';
import { useRestartAction } from 'shared/hooks/useRestartResource';
import StatefulSetCreate from './StatefulSetCreate';
import { StatefulSetPods } from './StatefulSetPods';
import {
  ResourceDescription,
  i18nDescriptionKey,
  docsURL,
} from 'resources/StatefulSets';
import { ResourcesListProps } from 'shared/components/ResourcesList/types';

export function StatefulSetList(
  props: { resourceUrl: string } & Omit<
    ResourcesListProps,
    | 'resourceTitle'
    | 'customColumns'
    | 'description'
    | 'customListActions'
    | 'createResourceForm'
    | 'emptyListProps'
  >,
) {
  const { t } = useTranslation();
  const restartAction = useRestartAction(props.resourceUrl);

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: (set: { metadata: { ownerReferences: OwnerReferences } }) => (
        <ControlledBy ownerReferences={set.metadata.ownerReferences} kindOnly />
      ),
    },
    {
      header: t('common.headers.pods'),
      value: (set: {
        status: { currentReplicas: number };
        spec: { replicas: number };
      }) => <StatefulSetPods key="replicas" set={set} />,
    },
  ];

  return (
    <ResourcesList
      resourceTitle={t('stateful-sets.title')}
      customColumns={customColumns}
      description={ResourceDescription}
      customListActions={[restartAction]}
      {...props}
      createResourceForm={StatefulSetCreate}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
    />
  );
}

export default StatefulSetList;
