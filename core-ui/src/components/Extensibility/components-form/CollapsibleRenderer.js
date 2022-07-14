import React from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import { useGetTranslation } from 'components/Extensibility/helpers';

export function CollapsibleRenderer({ schema, storeKeys, widgets, ...props }) {
  const { WidgetRenderer } = widgets;
  const ownSchema = schema.delete('widget');
  const { tFromStoreKeys } = useGetTranslation();

  // const requiredArray = [...ownSchema].find(el => el[0] === 'required');

  // console.log('ownschema', requiredArray);

  // const arr = requiredArray[1].toArray();
  // console.log('arr', arr);
  // // console.log('props', props);
  // const invalid = isInvalid(ownSchema);
  // console.log('invalid', invalid);
  // console.log(ValidityReporter);

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
