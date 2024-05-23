import { spacing } from '@ui5/webcomponents-react-base';
import { Card, CardHeader } from '@ui5/webcomponents-react';
import './ResourceDetails.scss';

export default function ResourceDetailsCard({
  content,
  wrapperClassname,
  titleText,
  className = '',
}) {
  return (
    <div style={spacing.sapUiSmallMarginBeginEnd} className={wrapperClassname}>
      <Card className={className} header={<CardHeader titleText={titleText} />}>
        <div
          style={{
            ...spacing.sapUiSmallMargin,
            ...spacing.sapUiTinyMarginTop,
          }}
          className="cluster-overview__details-grid"
        >
          {content}
        </div>
      </Card>
    </div>
  );
}
