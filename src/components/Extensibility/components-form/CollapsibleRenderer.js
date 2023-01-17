import React from 'react';
import './CollapsibleRenderer.scss';

import { ResourceForm } from 'shared/ResourceForm';
import { useGetTranslation } from 'components/Extensibility/helpers';

export function CollapsibleRenderer({
  schema,
  storeKeys,
  widgets,
  nestingLevel = 0,
  ...props
}) {
  const { WidgetRenderer } = widgets;
  const ownSchema = schema.delete('widget');
  const { tFromStoreKeys } = useGetTranslation();

  const columns = schema.get('columns');
  const gridTemplateColumns = `repeat(${columns}, 1fr)`;

  const defaultOpen = schema.get('defaultExpanded');

  return (
    <ResourceForm.CollapsibleSection
      title={tFromStoreKeys(storeKeys, schema)}
      defaultOpen={defaultOpen}
      nestingLevel={nestingLevel}
    >
      <div
        className="collapsible-renderer__grid-wrapper"
        style={{ gridTemplateColumns }}
      >
        <WidgetRenderer
          {...props}
          storeKeys={storeKeys}
          schema={ownSchema}
          widgets={widgets}
          nestingLevel={nestingLevel + 1}
        />
      </div>
    </ResourceForm.CollapsibleSection>
  );
}
