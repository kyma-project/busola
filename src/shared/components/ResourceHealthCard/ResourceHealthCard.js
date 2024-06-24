import { Title } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { spacing } from '@ui5/webcomponents-react-base';

export function ResourceHealthCard({
  customHealthCards,
  showHealthCardsTitle = false,
}) {
  const { t } = useTranslation();
  if (!customHealthCards?.length) return null;
  return (
    <>
      {showHealthCardsTitle && (
        <Title
          level="H3"
          style={{
            ...spacing.sapUiMediumMarginBegin,
            ...spacing.sapUiMediumMarginTopBottom,
          }}
        >
          {t('common.headers.monitoring-and-health')}
        </Title>
      )}
      <div className="cluster-stats" style={spacing.sapUiTinyMargin}>
        {customHealthCards}
      </div>
    </>
  );
}
