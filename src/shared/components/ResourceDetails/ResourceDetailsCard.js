import { Card, CardHeader } from '@ui5/webcomponents-react';
import './ResourceDetails.scss';

export default function ResourceDetailsCard({
  content,
  wrapperClassname,
  titleText,
  className = '',
}) {
  return (
    <div
      className={`${wrapperClassname} sap-margin-x-small sap-margin-y-small`}
    >
      <Card className={className} header={<CardHeader titleText={titleText} />}>
        <div className="cluster-overview__details-grid sap-margin-small sap-margin-top-tiny">
          {content}
        </div>
      </Card>
    </div>
  );
}
