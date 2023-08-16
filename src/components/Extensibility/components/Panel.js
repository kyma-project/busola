import React, { useState } from 'react';
import { Button } from '@ui5/webcomponents-react';
import { LayoutPanel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { mapValues } from 'lodash';
import classNames from 'classnames';

import { base64Decode } from 'shared/helpers';

import { useCreateResourceDescription, useGetTranslation } from '../helpers';
import { Widget, InlineWidget } from './Widget';

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

  const panelClassNames = classNames({
    'fd-margin--md': !disableMargin,
  });

  const bodyClassNames = classNames({
    'no-padding': structure?.disablePadding,
  });

  const header = structure?.header || [];
  const description = useCreateResourceDescription(structure?.description);

  if (isDecoded) {
    value = mapValues(value, base64Decode);
  }

  return (
    <LayoutPanel className={panelClassNames}>
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={widgetT(structure)}
          description={description}
          className="fd-margin-end--sm"
        />
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
        {decodable && (
          <LayoutPanel.Actions>
            <Button
              design="Transparent"
              icon={isDecoded ? 'hide' : 'show'}
              onClick={() => setDecoded(!isDecoded)}
            >
              {isDecoded
                ? t('secrets.buttons.encode')
                : t('secrets.buttons.decode')}
            </Button>
          </LayoutPanel.Actions>
        )}
      </LayoutPanel.Header>
      {Array.isArray(structure?.children) && (
        <LayoutPanel.Body className={bodyClassNames}>
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
        </LayoutPanel.Body>
      )}
    </LayoutPanel>
  );
}
