import { spacing } from '@ui5/webcomponents-react-base';
import { Card, CardHeader } from '@ui5/webcomponents-react';
import './ResourceDetails.scss';

export default function ResourceDetailsCard({
  content,
  wrapperClassname,
  titleText,
}) {
  return (
    <div style={spacing.sapUiSmallMarginBeginEnd} className={wrapperClassname}>
      <Card header={<CardHeader titleText={titleText} />}>
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
