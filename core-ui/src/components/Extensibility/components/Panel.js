import React from 'react';
import { LayoutPanel } from 'fundamental-react';

import { useGetTranslation } from '../helpers';
import { Widget, InlineWidget } from './Widget';
import classNames from 'classnames';

export function Panel({ value, structure, schema, hasExternalMargin = true }) {
  const { widgetT } = useGetTranslation();

  const panelClassNames = classNames({
    'fd-margin--md': hasExternalMargin,
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
              />
            ))
          : null}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
