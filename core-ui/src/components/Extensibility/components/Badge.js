import React from 'react';
import { isNil } from 'lodash';
import { useJsonata } from '../hooks/useJsonata';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useGetPlaceholder } from 'components/Extensibility/helpers';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

import './Badge.scss';

export function Badge({
  value,
  structure,
  schema,
  originalResource,
  scope,
  arrayItems,
}) {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  const jsonata = useJsonata({
    resource: originalResource,
    scope,
    value,
    arrayItems,
  });

  const [tooltip] = jsonata(structure?.description);

  let type = null;
  if (structure?.highlights) {
    const match = Object.entries(structure.highlights).find(([key, rule]) => {
      if (Array.isArray(rule)) {
        return rule.includes(value);
      } else {
        try {
          return jsonata(rule);
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
  ) : tooltip ? (
    <Tooltip content={tooltip || ''}>
      <span className="status-badge-wrapper has-tooltip">
        <StatusBadge autoResolveType={!type} type={type}>
          {value}
        </StatusBadge>
      </span>
    </Tooltip>
  ) : (
    <span className="status-badge-wrapper">
      <StatusBadge autoResolveType={!type} type={type}>
        {value}
      </StatusBadge>
    </span>
  );
}
Badge.inline = true;
Badge.copyable = true;
