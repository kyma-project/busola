import { Form, FormGroup } from '@ui5/webcomponents-react';
import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  ReactElement,
  ReactNode,
} from 'react';
import './ResourceDetailsCard.scss';

interface ResourceDetailsFormProps {
  children: ReactNode;
  className?: string;
}

// Children.toArray stops at fragments, which is how card content arrives.
function flattenItems(children: ReactNode, prefix = ''): ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return child;
    if (child.type === Fragment) {
      const { children: inner } = child.props as { children?: ReactNode };
      return flattenItems(inner, `${prefix}${child.key}`);
    }
    return prefix
      ? cloneElement(child, { key: `${prefix}${child.key}` })
      : child;
  });
}

const isFormGroup = (node: ReactNode) =>
  isValidElement(node) && (node as ReactElement).type === FormGroup;

// itemSpacing="Large" is UI5's spacing for read-only forms.
export function ResourceDetailsForm({
  children,
  className = '',
}: ResourceDetailsFormProps) {
  const items = flattenItems(children);
  // fill row by row, with a lone last item on the left
  const content = items.every(isFormGroup)
    ? items
    : Array.from({ length: Math.ceil(items.length / 2) }, (_, row) => (
        <FormGroup key={row} colSpan="S1 M2 L2 XL2">
          {items.slice(row * 2, row * 2 + 2)}
        </FormGroup>
      ));

  return (
    <Form
      layout="S1 M2 L2 XL2"
      labelSpan="S12 M4 L4 XL4"
      itemSpacing="Large"
      className={`resource-card-layout ${className}`.trim()}
    >
      {content}
    </Form>
  );
}
