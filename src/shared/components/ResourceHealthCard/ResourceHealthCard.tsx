import { Title } from '@ui5/webcomponents-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type ResourceHealthCardProps = {
  customHealthCards: ReactNode[];
  showHealthCardsTitle?: boolean;
};

export function ResourceHealthCard({
  customHealthCards,
  showHealthCardsTitle = false,
}: ResourceHealthCardProps) {
  const { t } = useTranslation();
  if (!customHealthCards?.length) return null;
  return (
    <section aria-labelledby="monitoring-heading">
      {showHealthCardsTitle && (
        <Title
          level="H3"
          size="H3"
          className="sap-margin-y-medium"
          id="monitoring-heading"
        >
          {t('common.headers.monitoring-and-health')}
        </Title>
      )}
      <div className="cluster-stats">{customHealthCards}</div>
    </section>
  );
}
