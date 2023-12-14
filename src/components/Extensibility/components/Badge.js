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

  if (type === 'negative') type = 'warning';
  else if (type === 'informative') type = 'information';
  else if (type === 'positive') type = 'success';
  else if (type === 'critical') type = 'error';

  return isNil(value) ? (
    emptyLeafPlaceholder
  ) : tooltip ? (
    <Tooltip content={tooltip || ''}>
      <span className="has-tooltip">
        <StatusBadge autoResolveType={!type} type={type}>
          {tExt(value)}
        </StatusBadge>
      </span>
    </Tooltip>
  ) : (
    <StatusBadge autoResolveType={!type} type={type}>
      {tExt(value)}
    </StatusBadge>
  );
}
Badge.inline = true;
Badge.copyable = true;
