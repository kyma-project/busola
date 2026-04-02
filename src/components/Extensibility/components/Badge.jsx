import { useEffect, useMemo, useState } from 'react';
import { isNil } from 'lodash';
import { useJsonata } from '../hooks/useJsonata';
import { useTranslation } from 'react-i18next';
import { Icon, Link } from '@ui5/webcomponents-react';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import {
  useGetPlaceholder,
  useGetTranslation,
  getBadgeType,
} from 'components/Extensibility/helpers';

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

  const [tooltip, setTooltip] = useState(null);
  const [tooltipError, setTooltipError] = useState(null);
  const [badgeType, setBadgeType] = useState(null);
  const [descriptionLink, setDescriptionLink] = useState(null);

  useEffect(() => {
    const setStatesFromJsonata = async () => {
      const [tooltipRes, tooltipErr] = await jsonata(structure?.description);
      const typeRes = await getBadgeType(
        structure.highlights,
        value,
        jsonata,
        t,
      );
      const [linkRes] = await jsonata(structure?.descriptionLink);
      setTooltip(tooltipRes);
      setTooltipError(tooltipErr);
      setBadgeType(typeRes);
      setDescriptionLink(linkRes || null);
    };
    setStatesFromJsonata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    structure?.description,
    structure?.descriptionLink,
    structure?.highlights,
    stableJsonataDeps,
  ]);

  const getTooltipContent = (description) => {
    const text = (() => {
      if (tooltip && !tooltipError) {
        return tooltip;
      }
      if (tooltip === null && !tooltipError) {
        return '';
      }
      return description;
    })();

    if (!descriptionLink) return text;

    return (
      <div>
        {text && <p>{text}</p>}
        <Link
          href={descriptionLink}
          target="_blank"
          rel="noopener noreferrer"
          accessibleName={descriptionLink}
          accessibleDescription={t('common.ariaLabel.new-tab-link')}
        >
          {descriptionLink}
          <Icon
            design="Information"
            name="inspect"
            className="bsl-icon-s sap-margin-begin-tiny"
            accessibleName={t('common.ariaLabel.new-tab-link')}
          />
        </Link>
      </div>
    );
  };

  return isNil(value) ? (
    emptyLeafPlaceholder
  ) : structure?.description || structure?.descriptionLink ? (
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
