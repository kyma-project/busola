import { useTranslation } from 'react-i18next';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';
import type { PodDisruptionBudget } from './types';
import { ResourceDetailsForm } from 'shared/components/ResourceDetails/ResourceDetailsForm';
import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';

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
      <ResourceDetailsForm>
        <ResourceDetailsFormItem
          label={t('pod-disruption-budgets.headers.min-available')}
          value={resource.spec.minAvailable}
        />
        <ResourceDetailsFormItem
          label={t('pod-disruption-budgets.headers.max-unavailable')}
          value={resource.spec.maxUnavailable}
        />
      </ResourceDetailsForm>
    </UI5Card>
  ) : null;
}
