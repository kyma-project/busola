import { isNil } from 'lodash';
import { useJsonata } from '../hooks/useJsonata';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import {
  useGetPlaceholder,
  useGetTranslation,
} from 'components/Extensibility/helpers';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

import './Badge.scss';
import { Popover } from '@ui5/webcomponents-react';

export function Badge({
  value,
  structure,
  originalResource,
  scope,
  arrayItems,
  singleRootResource,
  embedResource,
}) {
  const { t: tExt } = useGetTranslation();
  const { t } = useTranslation();
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  const jsonata = useJsonata({
    resource: originalResource,
    parent: singleRootResource,
    embedResource: embedResource,
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
        const [doesMatch, matchError] = jsonata(rule);
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

  if (type === 'negative') type = 'Warning';
  else if (type === 'informative') type = 'Information';
  else if (type === 'positive') type = 'Success';
  else if (type === 'critical') type = 'Error';

  return isNil(value) ? (
    emptyLeafPlaceholder
  ) : tooltip ? (
    <StatusBadge autoResolveType={!type} type={type} tooltipContent={tooltip}>
      {tExt(value)}
    </StatusBadge>
  ) : (
    <StatusBadge autoResolveType={!type} type={type}>
      {tExt(value)}
    </StatusBadge>
  );
}
Badge.inline = true;
Badge.copyable = true;
