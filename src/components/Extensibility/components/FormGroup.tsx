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
import 'shared/components/ResourceDetails/ResourceDetailsCard.scss';
import './FormGroup.scss';
import { HintButton } from 'shared/components/HintButton/HintButton';

export function FormItemWidget({
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

  const labelText = widgetT(structure);

  return (
    <FormItem
      labelContent={
        labelText ? <Label showColon>{labelText}</Label> : undefined
      }
    >
      <div>{displayValue}</div>
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
  nestedInColumns?: boolean;
  [key: string]: any;
}

function Group({
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
            singleRootResource={singleRootResource}
            embedResource={embedResource}
            {...props}
          />
        ))}
    </UI5FormGroup>
  );
}

export function FormGroup({
  nestedInColumns = false,
  ...props
}: FormGroupProps) {
  if (nestedInColumns) {
    return <Group {...props} />;
  }

  return (
    <Form
      className="resource-card-layout extensibility-read-form-group"
      layout="S1 M1 L1 XL1"
      labelSpan="S12 M4 L4 XL4"
      itemSpacing="Large"
    >
      <Group {...props} />
    </Form>
  );
}
