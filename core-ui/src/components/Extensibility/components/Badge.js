import React from 'react';
import { isNil } from 'lodash';
import jsonata from 'jsonata';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useGetPlaceholder } from 'components/Extensibility/helpers';

export function Badge({ value, structure, schema, ...props }) {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);

  let type = null;
  if (structure?.highlights) {
    const match = Object.entries(structure.highlights).find(([key, rule]) => {
      if (Array.isArray(rule)) {
        return rule.includes(value);
      } else {
        try {
          return jsonata(rule).evaluate({ data: value });
        } catch (e) {
          console.warn(`invalid rule: ${rule}`, e);
          return null;
        }
      }
    });
    if (match) {
      type = match[0];
    }
  }

  return isNil(value) ? (
    emptyLeafPlaceholder
  ) : (
    <span className="status-badge-wrapper">
      <StatusBadge autoResolveType={!type} type={type}>
        {value}
      </StatusBadge>
    </span>
  );
}
Badge.inline = true;
