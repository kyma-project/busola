import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useUrl } from 'hooks/useUrl';

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
  const { resourceUrl } = useUrl();

  const jsonata = useJsonata({
    resource: originalResource,
    scope,
    value,
    arrayItems,
  });

  if (!value) {
    return emptyLeafPlaceholder;
  }

  const [name, nameError] = jsonata(structure.resource?.name);
  const [namespace, namespaceError] = jsonata(structure.resource?.namespace);
  const [kind, kindError] = jsonata(structure.resource?.kind);

  const jsonataError = nameError || namespaceError || kindError;
  if (jsonataError) {
    return t('extensibility.configuration-error', {
      error: jsonataError.message,
    });
  }

  return (
    <Link
      className="fd-link"
      to={resourceUrl(
        {
          kind,
          metadata: {
            name,
          },
        },
        { namespace },
      )}
    >
      {tExt(value)}
    </Link>
  );
}

ResourceLink.inline = true;
