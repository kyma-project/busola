import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { useRestartAction } from 'shared/hooks/useRestartResource';
import StatefulSetCreate from './StatefulSetCreate';
import { StatefulSetPods } from './StatefulSetPods';
import {
  ResourceDescription,
  i18nDescriptionKey,
  docsURL,
} from 'resources/StatefulSets';

export function StatefulSetList(props) {
  const { t } = useTranslation();
  const restartAction = useRestartAction(props.resourceUrl);

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: set => (
        <ControlledBy ownerReferences={set.metadata.ownerReferences} kindOnly />
      ),
    },
    {
      header: t('common.headers.pods'),
      value: set => <StatefulSetPods key="replicas" set={set} />,
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
