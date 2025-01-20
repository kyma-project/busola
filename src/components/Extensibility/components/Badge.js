import { isNil } from 'lodash';
import { useJsonata } from '../hooks/useJsonata';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import {
  useGetPlaceholder,
  useGetTranslation,
  getBadgeType,
} from 'components/Extensibility/helpers';

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

  const [tooltip, tooltipError] = jsonata(structure?.description);

  const badgeType = getBadgeType(structure.highlights, value, jsonata, t);

  const getTooltipContent = description => {
    if (tooltip && !tooltipError) {
      return tooltip;
    }
    if (!tooltip && !tooltipError) {
      return '';
    }
    return description;
  };

  return isNil(value) ? (
    emptyLeafPlaceholder
  ) : structure?.description ? (
    <StatusBadge
      autoResolveType={!badgeType}
      type={badgeType}
      tooltipContent={getTooltipContent(structure.description)}
    >
      {tExt(value)}
    </StatusBadge>
  ) : (
    <StatusBadge autoResolveType={!badgeType} type={badgeType}>
      {tExt(value)}
    </StatusBadge>
  );
}
Badge.inline = true;
Badge.copyable = true;
