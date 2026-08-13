import { useTranslation } from 'react-i18next';
import { Text } from '@ui5/webcomponents-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';
import { PodDisruptionBudget } from './PodDisruptionBudgetsList';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

export default function PodDisruptionBudgetSpecification({
  resource,
}: {
  resource: PodDisruptionBudget;
}) {
  const { t } = useTranslation();

  return resource.spec ? (
    <UI5Card
      title={t('common.headers.specification')}
      accessibleName={t('common.accessible-name.specification')}
    >
      <LayoutPanelRow
        name={t('pod-disruption-budgets.headers.min-available')}
        value={
          <Text>{resource.spec.minAvailable ?? EMPTY_TEXT_PLACEHOLDER}</Text>
        }
      />
      <LayoutPanelRow
        name={t('pod-disruption-budgets.headers.max-unavailable')}
        value={
          <Text>{resource.spec.maxUnavailable ?? EMPTY_TEXT_PLACEHOLDER}</Text>
        }
      />
      <LayoutPanelRow
        name={t('pod-disruption-budgets.headers.current-healthy')}
        value={
          <Text>
            {resource.status.currentHealthy ?? EMPTY_TEXT_PLACEHOLDER}
          </Text>
        }
      />
      <LayoutPanelRow
        name={t('pod-disruption-budgets.headers.desired-healthy')}
        value={
          <Text>
            {resource.status.desiredHealthy ?? EMPTY_TEXT_PLACEHOLDER}
          </Text>
        }
      />
      <LayoutPanelRow
        name={t('pod-disruption-budgets.headers.disruptions-allowed')}
        value={
          <Text>
            {resource.status.disruptionsAllowed ?? EMPTY_TEXT_PLACEHOLDER}
          </Text>
        }
      />
      <LayoutPanelRow
        name={t('pod-disruption-budgets.headers.expected-pods')}
        value={
          <Text>{resource.status.expectedPods ?? EMPTY_TEXT_PLACEHOLDER}</Text>
        }
      />
      <LayoutPanelRow
        name={t('pod-disruption-budgets.headers.observed-generation')}
        value={
          <Text>
            {resource.status.observedGeneration ?? EMPTY_TEXT_PLACEHOLDER}
          </Text>
        }
      />
    </UI5Card>
  ) : null;
}
