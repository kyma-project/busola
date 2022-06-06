import React from 'react';
import { isNil } from 'lodash';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function Badge({ value, structure, schema }) {
  return isNil(value) ? (
    EMPTY_TEXT_PLACEHOLDER
  ) : (
    <span className="status-badge-wrapper">
      <StatusBadge autoResolveType>{value}</StatusBadge>
    </span>
  );
}
Badge.inline = true;
