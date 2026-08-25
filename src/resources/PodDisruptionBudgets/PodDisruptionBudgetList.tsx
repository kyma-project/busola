import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import PodDisruptionBudgetCreate from './PodDisruptionBudgetCreate';
import { docsURL, i18nDescriptionKey, ResourceDescription } from '.';
import { customColumns } from './PodDisruptionBudgetColumns';
import type { PodDisruptionBudgetsListProps } from './types';

export default function PodDisruptionBudgetList(
  props: PodDisruptionBudgetsListProps,
) {
  const { t } = useTranslation();

  return (
    <ResourcesList
      resourceTitle={t('pod-disruption-budgets.title')}
      description={ResourceDescription}
      {...props}
      createResourceForm={PodDisruptionBudgetCreate}
      customColumns={customColumns(t)}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
    />
  );
}
