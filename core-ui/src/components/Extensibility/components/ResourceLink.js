import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'fundamental-react';

import { navigateToResource } from 'shared/helpers/universalLinks';

import { useGetPlaceholder, useGetTranslation } from '../helpers';
import { useJsonata } from '../hooks/useJsonata';

export function ResourceLink({
  value,
  structure,
  originalResource,
  scope,
  arrayItems,
}) {
  const { t } = useTranslation();
  const { t: tExt } = useGetTranslation();
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);

  const jsonata = useJsonata({
    resource: originalResource,
    scope,
    value,
    arrayItems,
  });

  if (!value) {
    return emptyLeafPlaceholder;
  }

  const [name, nameError] = jsonata(structure.resource.name);
  const [namespace, namespaceError] = jsonata(structure.resource.namespace);
  const [kind, kindError] = jsonata(structure.resource.kind);
  const [linkText, linkTextError] = jsonata(structure.linkText);

  const jsonataError =
    nameError || namespaceError || kindError || linkTextError;
  if (jsonataError) {
    return t('extensibility.configuration-error', {
      error: jsonataError.message,
    });
  }

  return (
    <Link
      className="fd-link"
      onClick={() => navigateToResource({ name, namespace, kind })}
    >
      {tExt(linkText)}
    </Link>
  );
}

ResourceLink.inline = true;
