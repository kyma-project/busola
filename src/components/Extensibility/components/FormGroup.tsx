import { isNil } from 'lodash';
import {
  Form,
  FormGroup as UI5FormGroup,
  FormItem,
  Label,
} from '@ui5/webcomponents-react';
import { useGetPlaceholder, useGetTranslation } from '../helpers';
import { Widget } from './Widget';
import './FormGroup.scss';

function FormItemWidget({
  children,
  value,
  structure,
}: {
  children?: any;
  value?: any;
  structure: any;
  [key: string]: any;
}) {
  const { widgetT } = useGetTranslation();
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);

  const displayValue = !isNil(children)
    ? children
    : !isNil(value)
      ? value
      : emptyLeafPlaceholder;

  return (
    <FormItem labelContent={<Label showColon>{widgetT(structure)}</Label>}>
      <span>{displayValue}</span>
    </FormItem>
  );
}
FormItemWidget.copyable = (Renderer: any) => Renderer?.copyable;
FormItemWidget.copyFunction = (
  props: any,
  Renderer: any,
  defaultCopyFunction: any,
) =>
  Renderer?.copyFunction
    ? Renderer.copyFunction(props, Renderer, defaultCopyFunction)
    : defaultCopyFunction(props, Renderer, defaultCopyFunction);

interface FormGroupProps {
  value: any;
  structure: any;
  schema: any;
  singleRootResource: any;
  embedResource: any;
  [key: string]: any;
}

export function FormGroup({
  value,
  structure,
  schema,
  singleRootResource,
  embedResource,
  ...props
}: FormGroupProps) {
  const { widgetT } = useGetTranslation();

  return (
    <Form
      className="extensibility-read-form-group"
      layout="S1 M1 L1 XL1"
      labelSpan="S12 M12 L12 XL12"
    >
      <UI5FormGroup headerText={widgetT(structure)}>
        {Array.isArray(structure?.children) &&
          structure.children.map((def: any, idx: number) => (
            <Widget
              key={idx}
              value={value}
              structure={def}
              schema={schema}
              inlineRenderer={FormItemWidget}
              inlineContext={true}
              singleRootResource={singleRootResource}
              embedResource={embedResource}
              {...props}
            />
          ))}
      </UI5FormGroup>
    </Form>
  );
}
