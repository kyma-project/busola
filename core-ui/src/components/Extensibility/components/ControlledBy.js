import React from 'react';
import { isNil } from 'lodash';

import {
  ControlledBy as CB,
  ControlledByKind as CBK,
} from 'shared/components/ControlledBy/ControlledBy';
import { useGetPlaceholder } from 'components/Extensibility/helpers';

export function ControlledBy({ value, structure, schema }) {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  return isNil(value) ? emptyLeafPlaceholder : <CB ownerReferences={value} />;
}
export function ControlledByKind({ value, structure, schema }) {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  return isNil(value) ? emptyLeafPlaceholder : <CBK ownerReferences={value} />;
}
