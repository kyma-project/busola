import { Form } from '@ui5/webcomponents-react';
import { Widget } from './Widget';
import './Columns.scss';

interface ColumnsProps {
  structure: any;
  [key: string]: any;
}

export function Columns({ structure, ...props }: ColumnsProps) {
  const children = structure.children || [];
  const allFormGroups = children.every(
    (child: any) => child.widget === 'FormGroup',
  );

  if (allFormGroups) {
    return (
      <Form
        className="extensibility-columns"
        layout="S1 M2 L2 XL2"
        labelSpan="S12 M4 L4 XL4"
        data-testid="extensibility-columns"
      >
        {children.map((child: any) => (
          <Widget
            key={`form-group-${child.path || child.name}`}
            structure={child}
            nestedInColumns
            {...props}
          />
        ))}
      </Form>
    );
  }

  return (
    <div
      className="extensibility-columns-grid"
      data-testid="extensibility-columns"
    >
      {children.map((child: any) => (
        <Widget
          key={`form-group-${child.path || child.name}`}
          structure={child}
          {...props}
        />
      ))}
    </div>
  );
}
