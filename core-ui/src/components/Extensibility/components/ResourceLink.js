import React from 'react';
import { Link } from 'fundamental-react';
import { navigateToResource } from 'shared/helpers/universalLinks';
import { useTranslation } from 'react-i18next';
import { applyFormula, useGetPlaceholder, useGetTranslation } from '../helpers';

function getLinkData({ value, formulas, originalResource, t }) {
  const getValue = formula =>
    applyFormula(value, formula, t, { root: originalResource });

  try {
    return {
      linkData: {
        name: getValue(formulas.name),
        namespace: getValue(formulas.namespace),
        kind: getValue(formulas.kind),
      },
    };
  } catch (e) {
    console.warn(e);
    return { linkDataError: e };
  }
}

export function ResourceLink({ value, structure, originalResource }) {
  const { t } = useTranslation();
  const { t: tExt } = useGetTranslation();
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);

  if (!value) {
    return emptyLeafPlaceholder;
  }

  const { linkData, linkDataError } = getLinkData({
    value,
    formulas: structure.resource,
    originalResource,
    t,
  });

  if (linkDataError) {
    return t('extensibility.configuration-error', {
      error: linkDataError.message,
    });
  }

  const linkContent = tExt(structure.linkText, {
    data: value,
    root: originalResource,
  });

  return (
    <Link className="fd-link" onClick={() => navigateToResource(linkData)}>
      {linkContent}
    </Link>
  );
}

ResourceLink.inline = true;
