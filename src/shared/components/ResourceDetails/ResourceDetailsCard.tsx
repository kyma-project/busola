import { Card, CardHeader } from '@ui5/webcomponents-react';
import './ResourceDetailsCard.scss';
import { ReactNode } from 'react';

interface ResourceDetailsCardProps {
  content: ReactNode;
  wrapperClassname: string;
  titleText: string;
  className?: string;
}

export default function ResourceDetailsCard({
  content,
  wrapperClassname,
  titleText,
  className = '',
}: ResourceDetailsCardProps) {
  return (
    <div className={wrapperClassname}>
      <Card className={className} header={<CardHeader titleText={titleText} />}>
        <div className="cluster-overview__details-grid sap-margin-small sap-margin-top-tiny">
          {content}
        </div>
      </Card>
    </div>
  );
}
