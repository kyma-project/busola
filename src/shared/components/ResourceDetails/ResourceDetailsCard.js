import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, Title } from '@ui5/webcomponents-react';

export default function ResourceDetailsCard({ content }) {
  const { t } = useTranslation();

  return (
    <>
      <Title
        level="H3"
        style={{
          ...spacing.sapUiMediumMarginBegin,
          ...spacing.sapUiMediumMarginTopBottom,
        }}
      >
        {t('common.headers.resource-details')}
      </Title>
      <div style={spacing.sapUiSmallMarginBeginEnd}>
        <Card
          header={
            <CardHeader titleText={t('cluster-overview.headers.metadata')} />
          }
        >
          <div style={spacing.sapUiSmallMargin}>{content}</div>
        </Card>
      </div>
    </>
  );
}
