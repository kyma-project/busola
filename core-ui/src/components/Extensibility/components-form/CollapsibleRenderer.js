import React from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import { useGetTranslation } from 'components/Extensibility/helpers';

export function CollapsibleRenderer({ schema, storeKeys, widgets, ...props }) {
  const { WidgetRenderer } = widgets;
  const ownSchema = schema.delete('widget');
  const { tFromStoreKeys } = useGetTranslation();

  const columns = schema.get('columns');
  const style = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
  };

  return (
    <ResourceForm.CollapsibleSection title={tFromStoreKeys(storeKeys, schema)}>
      <div style={style}>
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
