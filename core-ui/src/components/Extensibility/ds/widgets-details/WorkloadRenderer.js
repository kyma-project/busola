import React from 'react';
import { useUIStore } from '@ui-schema/ui-schema';

import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Labels } from 'shared/components/Labels/Labels';
import { TransTitle } from '@ui-schema/ui-schema/Translate/TransTitle';

export function WorkloadRenderer({ storeKeys, schema, schemaKeys, ...props }) {
  const { store } = useUIStore();
  const { value } = store?.extractValues(storeKeys) || {};
  if (!value) return null;

  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={<TransTitle schema={schema} storeKeys={storeKeys} />}
        />
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
