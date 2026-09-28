import { isNil } from 'lodash';
import {
  Form,
  FormGroup as UI5FormGroup,
  FormItem,
  Label,
  Title,
} from '@ui5/webcomponents-react';
import { useState } from 'react';
import {
  useCreateResourceDescription,
  useGetPlaceholder,
  useGetTranslation,
} from '../helpers';
import { Widget } from './Widget';
import './FormGroup.scss';
import { HintButton } from 'shared/components/HintButton/HintButton';

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
      <div className="sap-margin-y-tiny">{displayValue}</div>
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
  const description = useCreateResourceDescription(structure?.description);
  const [showDescription, setShowDescription] = useState(false);

  return (
    <Form
      className="extensibility-read-form-group"
      layout="S1 M1 L1 XL1"
      labelSpan="S12 M12 L12 XL12"
    >
      <UI5FormGroup headerText={description ? undefined : widgetT(structure)}>
        {description && (
          <div className="ui5-form-group-heading">
            <Title level="H3" size="H6">
              {widgetT(structure)}
            </Title>
            <HintButton
              className="sap-margin-begin-tiny"
              setShowTitleDescription={setShowDescription}
              showTitleDescription={showDescription}
              description={description}
            />
          </div>
        )}
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
