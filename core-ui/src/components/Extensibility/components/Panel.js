import React from 'react';
import { LayoutPanel } from 'fundamental-react';

import { useCreateResourceDescription, useGetTranslation } from '../helpers';
import { Widget, InlineWidget } from './Widget';
import classNames from 'classnames';

export function Panel({
  value,
  structure,
  schema,
  disableMargin = false,
  ...props
}) {
  const { widgetT, t: tExt } = useGetTranslation();

  const panelClassNames = classNames({
    'fd-margin--md': !disableMargin,
  });

  const bodyClassNames = classNames({
    'no-padding': structure?.disablePadding,
  });

  const header = structure?.header || [];
  const description = useCreateResourceDescription(structure?.description);

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
                value={value}
                structure={def}
                schema={schema}
                inlineContext={true}
                {...props}
              />
            ))
          : null}
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
              {...props}
            />
          ))}
        </LayoutPanel.Body>
      )}
    </LayoutPanel>
  );
}
