import { Title } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

export function ResourceHealthCard({
  customHealthCards,
  showHealthCardsTitle = false,
}) {
  const { t } = useTranslation();
  if (!customHealthCards?.length) return null;
  return (
    <section aria-labelledby="monitoring-heading">
      {showHealthCardsTitle && (
        <Title
          level="H3"
          size="H3"
          className="sap-margin-begin-medium sap-margin-y-medium"
          id="monitoring-heading"
        >
          {t('common.headers.monitoring-and-health')}
        </Title>
      )}
      <div className="cluster-stats sap-margin-tiny">{customHealthCards}</div>
    </section>
  );
}
