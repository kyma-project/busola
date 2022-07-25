import React from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import { useGetTranslation } from 'components/Extensibility/helpers';

export function CollapsibleRenderer({ schema, storeKeys, widgets, ...props }) {
  const { WidgetRenderer } = widgets;
  const ownSchema = schema.delete('widget');
  const { tFromStoreKeys } = useGetTranslation();

  return (
    <ResourceForm.CollapsibleSection title={tFromStoreKeys(storeKeys)}>
      <WidgetRenderer
        {...props}
        storeKeys={storeKeys}
        schema={ownSchema}
        widgets={widgets}
      />
    </ResourceForm.CollapsibleSection>
  );
}
