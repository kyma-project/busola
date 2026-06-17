import { Widget } from './Widget';
import { Form, FormGroup } from '@ui5/webcomponents-react';

import './InlineDisplay.scss';

interface ColumnsProps {
  structure: any;
  [key: string]: any;
}

export function Columns({ structure, ...props }: ColumnsProps) {
  return (
    <Form layout="S1 M1 L2 XL2" className="form-without-background">
      {(structure.children || []).map((child: any) => (
        <FormGroup key={`column-${child.path || child.name}`}>
          <Widget structure={child} {...props} />
        </FormGroup>
      ))}
    </Form>
  );
}
