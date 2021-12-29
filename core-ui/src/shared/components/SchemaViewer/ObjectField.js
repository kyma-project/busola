import React from 'react';
import { LayoutPanel } from 'fundamental-react';

import { ObjectProperty } from './ObjectProperty';

export function ObjectField({ description, properties, required }) {
  return (
    <LayoutPanel>
      {description && (
        <LayoutPanel.Header>
          <div>{description}</div>
        </LayoutPanel.Header>
      )}
      <LayoutPanel.Body>
        <ul>
          {Object.entries(properties).map(([name, def]) => (
            <ObjectProperty name={name} def={def} required={required} />
          ))}
        </ul>
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
