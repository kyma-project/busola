import React from 'react';
import { memo } from '@ui-schema/ui-schema';
import { extractValue } from '@ui-schema/ui-schema/UIStore';

import { ResourceForm } from 'shared/ResourceForm';
import { useGetTranslation } from 'components/Extensibility/helpers';

function CollapsibleRendererCore({ schema, storeKeys, widgets, ...props }) {
  const { WidgetRenderer } = widgets;
  const ownSchema = schema.delete('widget');
  const { tFromStoreKeys } = useGetTranslation();

  return (
    <ResourceForm.CollapsibleSection title={tFromStoreKeys(storeKeys, schema)}>
      <WidgetRenderer
        {...props}
        storeKeys={storeKeys}
        schema={ownSchema}
        widgets={widgets}
      />
    </ResourceForm.CollapsibleSection>
  );
}

export const CollapsibleRenderer = extractValue(memo(CollapsibleRendererCore));
