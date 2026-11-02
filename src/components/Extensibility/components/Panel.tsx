import { useState } from 'react';
import {
  Button,
  Form,
  FormGroup as UI5FormGroup,
  Title,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { mapValues } from 'lodash';
import classNames from 'classnames';

import { base64Decode } from 'shared/helpers';

import { useCreateResourceDescription, useGetTranslation } from '../helpers';
import { FormItemWidget } from './FormGroup';
import { Widget } from './Widget';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

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

  const formClassNames = classNames({
    'no-padding': structure?.disablePadding,
  });

  const header = structure?.header || [];
  const description = useCreateResourceDescription(structure?.description);

  if (isDecoded) {
    value = mapValues(value, base64Decode);
  }

  return (
    <UI5Panel
      accessibleName={`${widgetT(structure)} panel`}
      title={
        <>
          <Title level="H5">{widgetT(structure)}</Title>
          {Array.isArray(header)
            ? header.map((def: any, idx: number) => (
                <Widget
                  key={idx}
                  structure={def}
                  schema={schema}
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
      description={description}
    >
      {Array.isArray(structure?.children) && (
        <Form
          layout="S1 M1 L1 XL1"
          labelSpan="S12 M4 L4 XL4"
          itemSpacing="Large"
          className={formClassNames || undefined}
        >
          <UI5FormGroup>
            {structure.children.map((def: any, idx: number) => (
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
        </Form>
      )}
    </UI5Panel>
  );
}
