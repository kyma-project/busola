import React from 'react';
import { LayoutPanel } from 'fundamental-react';

import { useGetTranslation } from '../helpers';
import { Widget, InlineWidget } from './Widget';
import classNames from 'classnames';

export function Panel({
  value,
  structure,
  schema,
  disableMargin = false,
  ...props
}) {
  const { widgetT } = useGetTranslation();

  const panelClassNames = classNames({
    'fd-margin--md': !disableMargin,
  });

  return (
    <LayoutPanel className={panelClassNames}>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={widgetT(structure)} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {Array.isArray(structure?.children)
          ? structure.children?.map((def, idx) => (
              <Widget
                key={idx}
                value={value}
                structure={def}
                schema={schema}
                inlineRenderer={InlineWidget}
                {...props}
              />
            ))
          : null}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
