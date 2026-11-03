import { useCreateResourceDescription, useGetTranslation } from '../helpers';
import { FormItemWidget } from './FormGroup';
import { Widget } from './Widget';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';
import { ResourceDetailsForm } from 'shared/components/ResourceDetails/ResourceDetailsForm';

interface CardProps {
  value: any;
  structure: any;
  schema: any;
  singleRootResource: any;
  embedResource: any;
  arrayItems?: any[];
  [key: string]: any;
}

export function CardWidget({
  value,
  structure,
  schema,
  singleRootResource: _singleRootResource,
  embedResource,
  arrayItems = [],
  ...props
}: CardProps) {
  const { widgetT } = useGetTranslation();
  const items = Array.isArray(value) ? value : [value];
  const description = useCreateResourceDescription(structure?.description);
  return (
    <UI5Card
      accessibleName={`${widgetT(structure)} card`}
      title={widgetT(structure)}
      description={description}
    >
      {Array.isArray(structure?.children) && (
        <ResourceDetailsForm layout="S1 M1 L1 XL1">
          {items.map((item: any, itemIdx: number) =>
            structure.children.map((def: any, idx: number) => (
              <Widget
                key={`${itemIdx}-${idx}`}
                value={item}
                arrayItems={[...arrayItems, item]}
                singleRootResource={item}
                structure={def}
                schema={schema}
                inlineRenderer={FormItemWidget}
                embedResource={embedResource}
                {...props}
              />
            )),
          )}
        </ResourceDetailsForm>
      )}
    </UI5Card>
  );
}

CardWidget.array = true;
