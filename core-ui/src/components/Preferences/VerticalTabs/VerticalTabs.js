import React from 'react';

import { TileButton } from '../ThemePreview/TileButton';
import './VerticalTabs.scss';

export function VerticalTabs({ tabs, children, height }) {
  const [tabId, setTabId] = React.useState(
    children.map(({ props }) => props.id)[0],
  );

  return (
    <section className="vertical-tabs-wrapper" style={{ height }}>
      <ul>
        {tabs.map(({ id, ...props }) => (
          <TileButton
            key={id}
            {...props}
            isActive={id === tabId}
            handleClick={() => setTabId(id)}
          />
        ))}
      </ul>
      {children.filter(({ props }) => props.id === tabId)}
    </section>
  );
}

VerticalTabs.Content = ({ children }) => children;
