import React from 'react';
import { useUIStore } from '@ui-schema/ui-schema';
import { LayoutPanel } from 'fundamental-react';

import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { prettifyNamePlural } from 'shared/utils/helpers';
import { Labels } from 'shared/components/Labels/Labels';

export function WorkloadRenderer({ storeKeys, schema, schemaKeys, ...props }) {
  const { store } = useUIStore();
  const { value } = store?.extractValues(storeKeys) || {};
  if (!value) return null;

  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={prettifyNamePlural(props.ownKey)} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <LayoutPanelRow
          name="Labels"
          value={
            <Labels labels={Object.fromEntries([...value.get('labels')])} />
          }
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
