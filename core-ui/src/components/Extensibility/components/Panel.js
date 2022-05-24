import React from 'react';
import { LayoutPanel } from 'fundamental-react';

import { useGetTranslation } from './helpers';
import { Widget, InlineWidget } from './Widget';

export function Panel({ value, structure, schema }) {
  const { t } = useGetTranslation();
  const key = structure.path || structure.id;

  return (
    <LayoutPanel className="fd-margin--md" key={key}>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t(key)} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {structure.children?.map((def, idx) => (
          <Widget
            key={idx}
            value={value}
            structure={def}
            schema={schema}
            inlineRenderer={InlineWidget}
          />
        ))}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
