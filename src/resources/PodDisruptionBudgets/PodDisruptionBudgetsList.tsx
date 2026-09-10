import { useTranslation } from 'react-i18next';
import { customColumns } from './PodDisruptionBudgetColumns';
import { Button } from '@ui5/webcomponents-react';
import pluralize from 'pluralize';
import { useNavigate } from 'react-router';
import { useSetAtom } from 'jotai';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import PodDisruptionBudgetCreate from './PodDisruptionBudgetCreate';
import { ResourceDescription } from '.';
import type { PodDisruptionBudgetsListProps } from './types';

export default function PodDisruptionBudgetsList(
  props: PodDisruptionBudgetsListProps,
) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setLayoutColumn = useSetAtom(columnLayoutAtom);
  const { namespaceUrl } = useUrl();

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
      customColumns={customColumns(t)}
    />
  );
}
