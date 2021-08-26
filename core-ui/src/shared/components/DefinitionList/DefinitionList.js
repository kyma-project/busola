import React from 'react';
import { LayoutPanel } from 'fundamental-react';
import './DefinitionList.scss';

export function DefinitionList({ title, list }) {
  return (
    <LayoutPanel className="fd-margin--md definition-list">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={title} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <dl>
          {list.map(({ name, value }) => (
            <React.Fragment key={name}>
              <dt>{name}</dt>
              <dt>{value}</dt>
            </React.Fragment>
          ))}
        </dl>
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
