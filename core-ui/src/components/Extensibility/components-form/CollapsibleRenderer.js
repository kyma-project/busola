import React from 'react';
import './CollapsibleRenderer.scss';

import { ResourceForm } from 'shared/ResourceForm';
import { useGetTranslation } from 'components/Extensibility/helpers';

export function CollapsibleRenderer({ schema, storeKeys, widgets, ...props }) {
  const { WidgetRenderer } = widgets;
  const ownSchema = schema.delete('widget');
  const { tFromStoreKeys } = useGetTranslation();

  const columns = schema.get('columns');
  const gridTemplateColumns = `repeat(${columns}, 1fr)`;

  return (
    <ResourceForm.CollapsibleSection title={tFromStoreKeys(storeKeys, schema)}>
      <div
        className="collapsible-renderer__grid-wrapper"
        style={{ gridTemplateColumns }}
      >
        <WidgetRenderer
          {...props}
          storeKeys={storeKeys}
          schema={ownSchema}
          widgets={widgets}
        />
      </div>
    </ResourceForm.CollapsibleSection>
  );
}
