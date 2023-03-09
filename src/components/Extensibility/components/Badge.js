import React, { useState } from 'react';
import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import {
  useGetPlaceholder,
  useGetTranslation,
} from 'components/Extensibility/helpers';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

import { useJsonata } from '../hooks/useJsonata';
import { DebugContext } from '../hooks/useDebugger';

import './Badge.scss';

export function Badge({
  value,
  structure,
  schema,
  originalResource,
  scope,
  arrayItems,
}) {
  const { t: tExt } = useGetTranslation();
  const { t } = useTranslation();
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);

  const jsonata = useJsonata({
    resource: originalResource,
    scope,
    value,
    arrayItems,
  });

  const [tooltip] = jsonata(structure?.description, { datapoint: 'tooltip' });

  let type = null;
  if (structure?.highlights) {
    const match = Object.entries(structure.highlights).find(([key, rule]) => {
      if (Array.isArray(rule)) {
        return rule.includes(value);
      } else {
        const [doesMatch, matchError] = jsonata(rule, {
          datapoint: `rule:${key}`,
        });
        if (matchError) {
          console.error(
            t('extensibility.configuration-error', {
              error: matchError.message,
            }),
          );
          return false;
        }
        return doesMatch;
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
          {tExt(value)}
        </StatusBadge>
      </span>
    </Tooltip>
  ) : (
    <span className="status-badge-wrapper">
      <StatusBadge autoResolveType={!type} type={type}>
        {tExt(value)}
      </StatusBadge>
    </span>
  );
}
Badge.inline = true;
Badge.copyable = true;
