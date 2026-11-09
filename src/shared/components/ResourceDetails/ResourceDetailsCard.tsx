import { Card, CardHeader } from '@ui5/webcomponents-react';
import { ReactNode } from 'react';
import { ResourceDetailsForm } from './ResourceDetailsForm';
import './ResourceDetailsCard.scss';

interface ResourceDetailsCardProps {
  content: ReactNode;
  titleText: string;
  className?: string;
  bottomContent?: ReactNode;
}

export default function ResourceDetailsCard({
  content,
  titleText,
  className = '',
  bottomContent,
}: ResourceDetailsCardProps) {
  return (
    <Card
      className={`resource-card ${className}`}
      header={<CardHeader titleText={titleText} />}
    >
      <ResourceDetailsForm>{content}</ResourceDetailsForm>
      {bottomContent && <div>{bottomContent}</div>}
    </Card>
  );
}
