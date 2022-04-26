import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { getValue, useGetTranslation } from './helpers';
import React from 'react';

export const CreateDetailPanel = metadata => resource => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const translate = useGetTranslation();

  return (
    <LayoutPanel className="fd-margin--lg" key={metadata.title}>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={translate(metadata.title)} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {metadata.properties.map(prop => {
          // todo move into a function and reuse elsewhere
          let value = getValue(resource, prop.valuePath);
          if (typeof value === 'boolean') {
            value = value.toString();
          }
          return (
            <LayoutPanelRow
              key={prop.valuePath}
              name={translate(prop.header)}
              value={value}
            />
          );
        })}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};
