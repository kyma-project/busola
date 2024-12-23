import { spacing } from '@ui5/webcomponents-react-base';
import { Card, CardHeader } from '@ui5/webcomponents-react';
import './ResourceDetails.scss';

type ResourceDetailsCardProps = {
  content: JSX.Element;
  wrapperClassname: string;
  titleText: string;
  className?: string;
};

export default function ResourceDetailsCard({
  content,
  wrapperClassname,
  titleText,
  className = '',
}: ResourceDetailsCardProps) {
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
