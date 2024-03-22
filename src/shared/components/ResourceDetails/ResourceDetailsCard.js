import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader } from '@ui5/webcomponents-react';
import './ResourceDetails.scss';

export default function ResourceDetailsCard({ content, wrapperClassname }) {
  const { t } = useTranslation();

  return (
    <div style={spacing.sapUiSmallMarginBeginEnd} className={wrapperClassname}>
      <Card
        header={
          <CardHeader titleText={t('cluster-overview.headers.metadata')} />
        }
      >
        <div
          style={spacing.sapUiSmallMargin}
          className="cluster-overview__details-grid"
        >
          {content}
        </div>
      </Card>
    </div>
  );
}
