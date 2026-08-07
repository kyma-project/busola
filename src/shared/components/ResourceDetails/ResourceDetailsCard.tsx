import { Card, CardHeader, Form } from '@ui5/webcomponents-react';
import { ReactNode } from 'react';
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
      <Form
        layout="S2 M2 L2 XL2"
        labelSpan="S12 M12 L12 XL12"
        className="resource-card-layout"
      >
        {content}
      </Form>
      {bottomContent && <div>{bottomContent}</div>}
    </Card>
  );
}
