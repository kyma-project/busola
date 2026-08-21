import { useTranslation } from 'react-i18next';
import { Button } from '@ui5/webcomponents-react';
import pluralize from 'pluralize';
import { useNavigate } from 'react-router';
import { useSetAtom } from 'jotai';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import PodDisruptionBudgetCreate from './PodDisruptionBudgetCreate';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ResourceDescription } from '.';
import type {
  PodDisruptionBudgetsListProps,
  PodDisruptionBudget,
} from './PodDisruptionBudgetList';

export default function PodDisruptionBudgetsList(
  props: PodDisruptionBudgetsListProps,
) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setLayoutColumn = useSetAtom(columnLayoutAtom);
  const { namespaceUrl } = useUrl();

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

  const handleShowCreate = () => {
    setLayoutColumn({
      startColumn: {
        resourceName: null,
        resourceType: 'PodDisruptionBudget',
        rawResourceTypeName: 'PodDisruptionBudget',
        namespaceId: props.namespace,
        apiGroup: 'policy',
        apiVersion: 'v1',
      },
      midColumn: null,
      endColumn: null,
      showCreate: {
        resourceType: props.resourceType,
        rawResourceTypeName: props.resourceType,
        namespaceId: props.namespace,
        resourceUrl: props.resourceUrl,
      },
      layout: 'TwoColumnsMidExpanded',
    });
    navigate(
      namespaceUrl(
        `${pluralize(
          props.resourceType.toLowerCase() || '',
        )}?layout=TwoColumnsMidExpanded&showCreate=true`,
      ),
    );
  };

  const createButton = !props?.disableCreate ? (
    <Button
      key={`create-pod-disruption-budgets`}
      data-testid={`create-pod-disruption-budgets`}
      onClick={handleShowCreate}
    >
      {t('components.resources-list.create')}
    </Button>
  ) : null;

  return (
    <ResourcesList
      resourceTitle={t('pod-disruption-budgets.title')}
      description={ResourceDescription}
      {...props}
      createResourceForm={PodDisruptionBudgetCreate}
      listHeaderActions={createButton}
      simpleEmptyListMessage
      customColumns={customColumns}
    />
  );
}
