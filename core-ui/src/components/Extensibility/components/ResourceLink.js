import React from 'react';
import { Link } from 'fundamental-react';
import { navigateToResource } from 'shared/helpers/universalLinks';
import { useTranslation } from 'react-i18next';
import { useGetPlaceholder, useGetTranslation } from '../helpers';
import jsonata from 'jsonata';

function getLinkData({ value, formulas, originalResource, t }) {
  const applyFormula = formula =>
    jsonata(formula).evaluate({ data: value, root: originalResource });

  try {
    return {
      linkData: {
        name: applyFormula(formulas.name),
        namespace: formulas.namespace && applyFormula(formulas.namespace),
        kind: applyFormula(formulas.kind),
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
    defaultValue: value.name,
  });

  return (
    <Link className="fd-link" onClick={() => navigateToResource(linkData)}>
      {linkContent}
    </Link>
  );
}

ResourceLink.inline = true;
