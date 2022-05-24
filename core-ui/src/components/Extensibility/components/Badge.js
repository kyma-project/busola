import React from 'react';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function Badge({ value, structure, schema }) {
  return (
    <span className="status-badge-wrapper">
      <StatusBadge>{value}</StatusBadge>
    </span>
  );
}
Badge.inline = true;
