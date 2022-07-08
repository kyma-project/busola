import React from 'react';
import { isNil } from 'lodash';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useGetPlaceholder } from 'components/Extensibility/helpers';

export function Badge({ value, structure, schema }) {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  return isNil(value) ? (
    emptyLeafPlaceholder
  ) : (
    <span className="status-badge-wrapper">
      <StatusBadge autoResolveType>{value}</StatusBadge>
    </span>
  );
}
Badge.inline = true;
