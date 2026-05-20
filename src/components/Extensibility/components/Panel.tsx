import { useState } from 'react';
import { Button, Text, Title } from '@ui5/webcomponents-react';
import { ToolbarSeparator } from '@ui5/webcomponents-react-compat/dist/components/ToolbarSeparator/index.js';
import { useTranslation } from 'react-i18next';
import { mapValues } from 'lodash';
import classNames from 'classnames';

import { base64Decode } from 'shared/helpers';

import { useCreateResourceDescription, useGetTranslation } from '../helpers';
import { Widget, InlineWidget } from './Widget';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';

interface PanelProps {
  value: any;
  structure: any;
  schema: any;
  singleRootResource: any;
  embedResource: any;
  [key: string]: any;
}

export function Panel({
  value,
  structure,
  schema,
  singleRootResource,
  embedResource,
  ...props
}: PanelProps) {
  const { decodable } = structure;

  const { t } = useTranslation();
  const { widgetT } = useGetTranslation();

  const [isDecoded, setDecoded] = useState(false);

  const bodyClassNames = classNames({
    'no-padding': structure?.disablePadding,
  });

  const header = structure?.header || [];
  const description = useCreateResourceDescription(structure?.description);

  if (isDecoded) {
    value = mapValues(value, base64Decode);
  }

  return (
    <UI5Card
      accessibleName={`${widgetT(structure)} panel`}
      title={
        <>
          <Title level="H5">{widgetT(structure)}</Title>
          {description && (
            <>
              <ToolbarSeparator />
              <Text>{description}</Text>
            </>
          )}
          {Array.isArray(header)
            ? header.map((def: any, idx: number) => (
                <Widget
                  key={idx}
                  structure={def}
                  schema={schema}
                  inlineContext={true}
                  singleRootResource={singleRootResource}
                  embedResource={embedResource}
                  {...props}
                />
              ))
            : null}
        </>
      }
      headerActions={
        decodable && (
          <Button design="Transparent" onClick={() => setDecoded(!isDecoded)}>
            {isDecoded
              ? t('secrets.buttons.encode')
              : t('secrets.buttons.decode')}
          </Button>
        )
      }
    >
      {Array.isArray(structure?.children) && (
        <div className={bodyClassNames}>
          {structure.children.map((def: any, idx: number) => (
            <Widget
              key={idx}
              value={value}
              structure={def}
              schema={schema}
              inlineRenderer={InlineWidget}
              inlineContext={true}
              singleRootResource={singleRootResource}
              embedResource={embedResource}
              {...props}
            />
          ))}
        </div>
      )}
    </UI5Card>
  );
}
