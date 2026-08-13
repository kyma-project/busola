import { useTranslation } from 'react-i18next';
import { ToolbarButton } from '@ui5/webcomponents-react';
import { useNavigate } from 'react-router';
import { useSetAtom } from 'jotai';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { docsURL, i18nDescriptionKey } from '.';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useUrl } from 'hooks/useUrl';
import pluralize from 'pluralize';

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
        apiGroup: '',
        apiVersion: 'policy/v1',
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

  const createButton = (
    <ToolbarButton
      key={`create-pod-disruption-budgets`}
      data-testid={`create-pod-disruption-budgets`}
      onClick={handleShowCreate}
      text={t('components.resources-list.create')}
    />
  );

  return (
    <ResourcesList
      resourceTitle={t('pod-disruption-budgets.title')}
      {...props}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
      customColumns={customColumns}
      listHeaderActions={createButton}
    />
  );
}
