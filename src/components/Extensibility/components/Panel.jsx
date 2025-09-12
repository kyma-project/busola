import React, { useState } from 'react';
import { Button, Title } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { mapValues } from 'lodash';
import classNames from 'classnames';

import { base64Decode } from 'shared/helpers';

import { useCreateResourceDescription, useGetTranslation } from '../helpers';
import { Widget, InlineWidget } from './Widget';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

export function Panel({
  value,
  structure,
  schema,
  disableMargin = false,
  singleRootResource,
  embedResource,
  ...props
}) {
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
    <UI5Panel
      disableMargin={disableMargin}
      title={
        <>
          <Title level="H5">{widgetT(structure)}</Title>
          {Array.isArray(header)
            ? header.map((def, idx) => (
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
          <Button
            design="Transparent"
            icon={isDecoded ? 'hide' : 'show'}
            onClick={() => setDecoded(!isDecoded)}
          >
            {isDecoded
              ? t('secrets.buttons.encode')
              : t('secrets.buttons.decode')}
          </Button>
        )
      }
      description={description}
    >
      {Array.isArray(structure?.children) && (
        <div className={bodyClassNames}>
          {structure.children.map((def, idx) => (
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
    </UI5Panel>
  );
}
