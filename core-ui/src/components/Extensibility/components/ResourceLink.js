import React from 'react';
import { Link } from 'fundamental-react';
import { navigateToResource } from 'shared/helpers/universalLinks';
import { useTranslation } from 'react-i18next';
import { useGetPlaceholder, useGetTranslation } from '../helpers';
import { jsonataWrapper } from '../helpers/jsonataWrapper';

function getLinkData({ value, formulas, originalResource, t }) {
  const applyFormula = formula =>
    jsonataWrapper(formula).evaluate({ data: value, root: originalResource });

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

  const linkText = structure.linkText
    ? jsonataWrapper(structure.linkText).evaluate()
    : '';

  const linkContent = tExt(linkText, {
    data: linkData?.name || value,
    root: originalResource,
    defaultValue: linkText || linkData?.name,
  });

  return (
    <Link className="fd-link" onClick={() => navigateToResource(linkData)}>
      {linkContent}
    </Link>
  );
}

ResourceLink.inline = true;
