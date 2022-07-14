import React from 'react';
import { LayoutPanel } from 'fundamental-react';

import { useGetTranslation } from '../helpers';
import { Widget, InlineWidget } from './Widget';

export function Panel({ value, structure, schema }) {
  const { widgetT } = useGetTranslation();

  return (
    <LayoutPanel>
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
