import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ResourceDescription } from '.';
import { PodDisruptionBudget } from './PodDisruptionBudgetsList';
import PodDisruptionBudgetSpecification from './PodDisruptionBudgetSpecification';
import PodDisruptionBudgetCreate from './PodDisruptionBudgetCreate';

export default function PodDisruptionBudgetDetails(props: any) {
  const customComponents = [
    (resource: PodDisruptionBudget) => (
      <PodDisruptionBudgetSpecification
        key="pod-disruption-budget-specification"
        resource={resource}
      />
    ),
  ];

  return (
    <ResourceDetails
      description={ResourceDescription}
      createResourceForm={PodDisruptionBudgetCreate}
      customComponents={customComponents}
      {...props}
    />
  );
}
