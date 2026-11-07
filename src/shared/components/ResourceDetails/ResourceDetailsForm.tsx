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
  singleColumn?: boolean;
  layout?: string;
}

// Children.toArray stops at fragments, which is how card content arrives.
// A component counts as one item however many FormItems it renders.
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

function columnsFromLayout(layout: string): number {
  const m = layout.match(/M(\d+)/);
  return m ? parseInt(m[1], 10) : 2;
}

// itemSpacing="Large" is UI5's spacing for read-only forms.
export function ResourceDetailsForm({
  children,
  className = '',
  singleColumn = false,
  layout = singleColumn ? 'S1 M1 L1 XL1' : 'S1 M2 L2 XL2',
}: ResourceDetailsFormProps) {
  const items = flattenItems(children);
  const columns = columnsFromLayout(layout);
  // Mixed FormGroup/FormItem children would nest FormGroups; not supported.
  const content = items.every(isFormGroup) ? (
    items
  ) : columns >= 2 ? (
    (() => {
      const half = Math.ceil(items.length / 2);
      return (
        <>
          <FormGroup>{items.slice(0, half)}</FormGroup>
          {items.length > half && <FormGroup>{items.slice(half)}</FormGroup>}
        </>
      );
    })()
  ) : (
    <FormGroup>{items}</FormGroup>
  );

  return (
    <Form
      layout={layout}
      labelSpan="S12 M4 L4 XL4"
      itemSpacing="Large"
      className={`resource-card-layout ${className}`.trim()}
    >
      {content}
    </Form>
  );
}
