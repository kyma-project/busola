import React from 'react';

import { ControlledBy as CB } from 'shared/components/ControlledBy/ControlledBy';
import { useGetPlaceholder } from 'components/Extensibility/helpers';

export function ControlledBy({ value, structure }) {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  return (
    <CB
      ownerReferences={value}
      kindOnly={structure?.kindOnly}
      placeholder={emptyLeafPlaceholder}
    />
  );
}
