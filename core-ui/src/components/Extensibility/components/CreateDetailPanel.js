import React from 'react';
import { getValue, useGetTranslation } from './helpers';
import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { isEmpty } from 'lodash';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

const createValueToDisplay = (resource, prop) => {
  let value = getValue(resource, prop.valuePath);
  console.log(value);

  if (typeof value === 'number' || typeof value === 'string') return value;
  if (typeof value === 'boolean') {
    value = value.toString();
  }

  if (Array.isArray(value)) {
    const arrayString = value.join('\n');
    console.log(arrayString);
    return arrayString;
  }

  if (typeof value === 'object' && value !== null) {
    if (isEmpty(value)) return EMPTY_TEXT_PLACEHOLDER;
  }
};

export const CreateDetailPanel = metadata => resource => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const translate = useGetTranslation();
  return (
    <LayoutPanel className="fd-margin--md" key={metadata.title}>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={translate(metadata.title)} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {metadata.properties.map(prop => {
          // todo move into a function and reuse elsewhere
          const value = createValueToDisplay(resource, prop);

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
