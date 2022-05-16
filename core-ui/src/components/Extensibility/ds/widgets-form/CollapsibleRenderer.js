import React from 'react';

import { TransTitle } from '@ui-schema/ui-schema/Translate/TransTitle';

import { ResourceForm } from 'shared/ResourceForm';

export function CollapsibleRenderer({ schema, storeKeys, widgets, ...props }) {
  const { WidgetRenderer } = widgets;
  const ownSchema = schema.delete('widget');

  return (
    <ResourceForm.CollapsibleSection
      title={<TransTitle schema={schema} storeKeys={storeKeys} />}
    >
      <WidgetRenderer
        {...props}
        storeKeys={storeKeys}
        schema={ownSchema}
        widgets={widgets}
      />
    </ResourceForm.CollapsibleSection>
  );
}
