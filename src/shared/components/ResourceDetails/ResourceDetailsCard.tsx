import { Card, CardHeader, Form } from '@ui5/webcomponents-react';
import './ResourceDetailsCard.scss';
import { ReactNode } from 'react';

interface ResourceDetailsCardProps {
  content: ReactNode;
  titleText: string;
  className?: string;
}

export default function ResourceDetailsCard({
  content,
  titleText,
  className = '',
}: ResourceDetailsCardProps) {
  return (
    <Card
      className={`resource-card ${className}`}
      header={<CardHeader titleText={titleText} />}
    >
      <Form
        layout="S2 M2 L2 XL2"
        labelSpan="S12 M12 L12 XL12"
        className="resource-card-layout"
      >
        {content}
      </Form>
    </Card>
  );
}
