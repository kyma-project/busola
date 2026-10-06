import { Form, FormGroup } from '@ui5/webcomponents-react';
import { Widget } from './Widget';

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
    <Form layout={layout} data-testid="extensibility-columns">
      {(structure.children || []).map((child: any) => (
        <FormGroup key={`form-group-${child.path || child.name}`}>
          <Widget structure={child} {...props} />
        </FormGroup>
      ))}
    </Form>
  );
}
