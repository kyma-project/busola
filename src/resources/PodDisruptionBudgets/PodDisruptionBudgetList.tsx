import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import PodDisruptionBudgetCreate from './PodDisruptionBudgetCreate';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { docsURL, i18nDescriptionKey, ResourceDescription } from '.';

export type PodDisruptionBudgetsListProps = {
  namespace: string;
  resourceType: string;
  resourceUrl: string;
  disableCreate?: boolean;
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
    selector: {
      matchLabels: Record<string, string>;
      matchExpressions?: any[];
    };
  };
  status: {
    currentHealthy?: number;
    desiredHealthy?: number;
    disruptionsAllowed?: number;
    expectedPods?: number;
    observedGeneration?: number;
    conditions?: Record<string, any>[];
  };
};

export default function PodDisruptionBudgetList(
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
      description={ResourceDescription}
      {...props}
      createResourceForm={PodDisruptionBudgetCreate}
      customColumns={customColumns}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
    />
  );
}
