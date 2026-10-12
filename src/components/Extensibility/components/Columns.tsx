import { Form, FormGroup } from '@ui5/webcomponents-react';
import { Widget } from './Widget';
import './Columns.scss';

interface ColumnsProps {
  structure: any;
  [key: string]: any;
}

export function Columns({ structure, ...props }: ColumnsProps) {
  const allFormGroups = (structure.children || []).every(
    (child: any) => child.widget === 'FormGroup',
  );
  const layout = allFormGroups ? 'S1 M2 L2 XL2' : 'S1 M1 L2 XL2';

  return (
    <Form
      className="extensibility-columns"
      layout={layout}
      data-testid="extensibility-columns"
    >
      {(structure.children || []).map((child: any) => (
        <Widget
          key={`form-group-${child.path || child.name}`}
          structure={child}
          wrapper={FormGroup}
          {...props}
        />
      ))}
    </Form>
  );
}
