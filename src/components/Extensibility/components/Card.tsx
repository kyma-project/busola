import { useState } from 'react';
import { mapValues } from 'lodash';

import { base64Decode } from 'shared/helpers';

import { useGetTranslation } from '../helpers';
import { Widget, InlineWidget } from './Widget';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';

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
  const [isDecoded] = useState(false);

  if (isDecoded) {
    value = mapValues(value, base64Decode);
  }

  const items = Array.isArray(value) ? value : [value];

  return (
    <UI5Card
      accessibleName={`${widgetT(structure)} card`}
      title={widgetT(structure)}
    >
      {Array.isArray(structure?.children) && (
        <div>
          {items.map((item: any, itemIdx: number) =>
            structure.children.map((def: any, idx: number) => (
              <Widget
                key={`${itemIdx}-${idx}`}
                value={item}
                arrayItems={[...arrayItems, item]}
                singleRootResource={item}
                structure={def}
                schema={schema}
                inlineRenderer={InlineWidget}
                inlineContext={true}
                embedResource={embedResource}
                {...props}
              />
            )),
          )}
        </div>
      )}
    </UI5Card>
  );
}

CardWidget.array = true;
