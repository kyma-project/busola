import { isNil } from 'lodash';
import { useJsonata } from '../hooks/useJsonata';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import {
  useGetPlaceholder,
  useGetTranslation,
} from 'components/Extensibility/helpers';

import './Badge.scss';

const TYPE_FALLBACK = new Map([
  ['success', 'Success'],
  ['warning', 'Warning'],
  ['error', 'Error'],
  ['info', 'Information'],
]);

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

  const [tooltip, tooltipError] = jsonata(structure?.description);

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
  else if (type === 'none') type = 'None';

  type = TYPE_FALLBACK.get(type) || type;

  const getTooltipContent = description => {
    if (tooltip && !tooltipError) {
      return tooltip;
    }
    if (!tooltip && !tooltipError) {
      return '';
    }
    return description;
  };

  const runningStatus = originalResource?.status?.conditions?.find(
    condition => condition.type === 'Running',
  );

  return isNil(value) ? (
    emptyLeafPlaceholder
  ) : structure?.description ? (
    <StatusBadge
      autoResolveType={!type}
      type={type}
      tooltipContent={getTooltipContent(structure.description)}
      latestStatusUpdate={runningStatus}
    >
      {tExt(value)}
    </StatusBadge>
  ) : (
    <StatusBadge
      autoResolveType={!type}
      type={type}
      latestStatusUpdate={runningStatus}
    >
      {tExt(value)}
    </StatusBadge>
  );
}
Badge.inline = true;
Badge.copyable = true;
