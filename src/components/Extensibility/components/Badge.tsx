import { useEffect, useMemo, useState } from 'react';
import { isNil } from 'lodash';
import { useJsonata } from '../hooks/useJsonata';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import {
  useGetPlaceholder,
  useGetTranslation,
  getBadgeType,
} from 'components/Extensibility/helpers';

interface BadgeProps {
  value: any;
  structure: any;
  originalResource: any;
  scope: any;
  arrayItems: any;
  singleRootResource: any;
  embedResource: any;
}

export function Badge({
  value,
  structure,
  originalResource,
  scope,
  arrayItems,
  singleRootResource,
  embedResource,
}: BadgeProps) {
  const { t: tExt } = useGetTranslation();
  const { t } = useTranslation();
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  const stableJsonataDeps = useMemo(
    () => ({
      resource: originalResource,
      parent: singleRootResource,
      embedResource: embedResource,
      scope,
      value,
      arrayItems,
    }),
    [
      originalResource,
      singleRootResource,
      embedResource,
      scope,
      value,
      arrayItems,
    ],
  );
  const jsonata = useJsonata(stableJsonataDeps);

  const [tooltip, setTooltip] = useState<string | null>(null);
  const [tooltipError, setTooltipError] = useState<Error | null>(null);
  const [badgeType, setBadgeType] = useState<string | null>(null);

  useEffect(() => {
    const setStatesFromJsonata = async () => {
      const [tooltipRes, tooltipErr] = await jsonata(structure?.description);
      const typeRes = await getBadgeType(
        structure.highlights,
        value,
        jsonata,
        t,
      );
      setTooltip(tooltipRes);
      setTooltipError(tooltipErr);
      setBadgeType(typeRes);
    };
    setStatesFromJsonata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure?.description, structure?.highlights, stableJsonataDeps]);

  const getTooltipContent = (description: any) => {
    if (tooltip && !tooltipError) {
      return tooltip;
    }
    if (tooltip === null && !tooltipError) {
      return '';
    }
    return description;
  };

  return isNil(value) ? (
    emptyLeafPlaceholder
  ) : structure?.description ? (
    <StatusBadge
      autoResolveType={!badgeType}
      type={badgeType as any}
      tooltipContent={getTooltipContent(structure.description)}
    >
      {tExt(value)}
    </StatusBadge>
  ) : (
    <StatusBadge autoResolveType={!badgeType} type={badgeType as any}>
      {tExt(value)}
    </StatusBadge>
  );
}
Badge.inline = true;
Badge.copyable = true;
