import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import PodDisruptionBudgetCreate from './PodDisruptionBudgetCreate';
import { docsURL, i18nDescriptionKey } from '.';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

type PodDisruptionBudgetsListProps = {
  namespace: string;
  resourceType: string;
  resourceUrl: string;
  [key: string]: any;
};

export type PodDisruptionBudget = {
  metadata: {
    name: string;
    namespace: string;
  };
  spec: {
    minAvailable: number;
    maxUnavailable: number;
  };
  status: {
    currentHealthy?: number;
    desiredHealthy?: number;
    disruptionsAllowed?: number;
    expectedPods?: number;
    observedGeneration?: number;
  };
};

export default function PodDisruptionBudgetsList(
  props: PodDisruptionBudgetsListProps,
) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('pod-disruption-budgets.headers.min-available'),
      value: (podDisruptionBudget: PodDisruptionBudget) =>
        podDisruptionBudget.spec?.minAvailable ?? EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pod-disruption-budgets.headers.max-unavailable'),
      value: (podDisruptionBudget: PodDisruptionBudget) =>
        podDisruptionBudget.spec?.maxUnavailable ?? EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pod-disruption-budgets.headers.current-healthy'),
      value: (podDisruptionBudget: PodDisruptionBudget) =>
        podDisruptionBudget.status?.currentHealthy ?? EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pod-disruption-budgets.headers.desired-healthy'),
      value: (podDisruptionBudget: PodDisruptionBudget) =>
        podDisruptionBudget.status?.desiredHealthy ?? EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pod-disruption-budgets.headers.disruptions-allowed'),
      value: (podDisruptionBudget: PodDisruptionBudget) =>
        podDisruptionBudget.status?.disruptionsAllowed ??
        EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  return (
    <ResourcesList
      resourceTitle={t('pod-disruption-budgets.title')}
      {...props}
      createResourceForm={PodDisruptionBudgetCreate}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
      customColumns={customColumns}
    />
  );
}
