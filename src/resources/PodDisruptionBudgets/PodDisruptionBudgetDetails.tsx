import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ResourceDescription } from '.';
import { PodDisruptionBudget } from './types';
import PodDisruptionBudgetSpecification from './PodDisruptionBudgetSpecification';
import PodDisruptionBudgetCreate from './PodDisruptionBudgetCreate';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Selector } from 'shared/components/Selector/Selector';
import { useTranslation } from 'react-i18next';

const MatchSelector = (pdb: PodDisruptionBudget) => (
  <Selector
    key="match-selector"
    namespace={pdb.metadata.namespace}
    labels={pdb.spec?.selector?.matchLabels}
    expressions={pdb.spec?.selector?.matchExpressions}
    selector={pdb.spec?.selector}
  />
);

export default function PodDisruptionBudgetDetails(props: any) {
  const { t } = useTranslation();
  const customComponents = [
    MatchSelector,
    (resource: PodDisruptionBudget) => (
      <PodDisruptionBudgetSpecification
        key="pod-disruption-budget-specification"
        resource={resource}
      />
    ),
  ];

  const customStatusColumns = [
    {
      header: t('pod-disruption-budgets.headers.current-healthy'),
      value: (resource: PodDisruptionBudget) =>
        resource.status.currentHealthy ?? EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pod-disruption-budgets.headers.desired-healthy'),
      value: (resource: PodDisruptionBudget) =>
        resource.status.desiredHealthy ?? EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pod-disruption-budgets.headers.disruptions-allowed'),
      value: (resource: PodDisruptionBudget) =>
        resource.status.disruptionsAllowed ?? EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pod-disruption-budgets.headers.observed-generation'),
      value: (resource: PodDisruptionBudget) =>
        resource.status.observedGeneration ?? EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pod-disruption-budgets.headers.expected-pods'),
      value: (resource: PodDisruptionBudget) =>
        resource.status.expectedPods ?? EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  const statusConditions = (pdb: PodDisruptionBudget) => {
    return pdb?.status?.conditions?.map((condition: Record<string, any>) => {
      const overridenStatus = () => {
        if (condition.type === 'DisruptionAllowed')
          return condition.status === 'True' ? 'Positive' : 'Negative';
        return undefined;
      };
      return {
        header: {
          titleText: condition.type,
          status: condition.status,
          overrideStatusType: overridenStatus(),
        },
        message: condition.message || condition.reason,
      };
    });
  };

  return (
    <ResourceDetails
      description={ResourceDescription}
      createResourceForm={PodDisruptionBudgetCreate}
      customComponents={customComponents}
      customStatusColumns={customStatusColumns}
      statusConditions={statusConditions}
      {...props}
    />
  );
}
