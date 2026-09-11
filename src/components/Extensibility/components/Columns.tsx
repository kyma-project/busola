import { Form, FormGroup } from '@ui5/webcomponents-react';
import { Widget } from './Widget';

interface ColumnsProps {
  structure: any;
  [key: string]: any;
}

export function Columns({ structure, ...props }: ColumnsProps) {
  return (
    <Form layout="S1 M1 L2 XL2" data-testid="extensibility-columns">
      {(structure.children || []).map((child: any) => (
        <FormGroup key={`form-group-${child.path || child.name}`}>
          <Widget structure={child} {...props} />
        </FormGroup>
      ))}
    </Form>
  );
}
