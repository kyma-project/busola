import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useUrl } from 'hooks/useUrl';

import { useGetPlaceholder, useGetTranslation } from '../helpers';
import { useJsonata } from '../hooks/useJsonata';
import { useGet } from 'shared/hooks/BackendAPI/useGet';

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
  const { resourceUrl, scopedUrl } = useUrl();

  const jsonata = useJsonata({
    resource: originalResource,
    scope,
    value,
    arrayItems,
  });

  const [name, nameError] = jsonata(structure.resource?.name);
  const [namespace, namespaceError] = jsonata(structure.resource?.namespace);
  const [kind, kindError] = jsonata(structure.resource?.kind);
  const crd = structure.resource?.crd ?? '';

  const { error } = useGet(
    resourceUrl(
      {
        kind,
        metadata: {
          name,
        },
      },
      { namespace },
    ),
    {
      skip: false,
      pollingInterval: 0,
      onDataReceived: () => {},
    },
  );

  const link = error
    ? scopedUrl(
        namespace
          ? `namespaces/${namespace}/customresources/${crd}/${name}`
          : `/customresources/${crd}/${name}`,
      )
    : resourceUrl(
        {
          kind,
          metadata: {
            name,
          },
        },
        { namespace },
      );

  if (!value) {
    return emptyLeafPlaceholder;
  }

  const jsonataError = nameError || namespaceError || kindError;
  if (jsonataError) {
    return t('extensibility.configuration-error', {
      error: jsonataError.message,
    });
  }

  return (
    <Link className="fd-link" to={link}>
      {tExt(value)}
    </Link>
  );
}

ResourceLink.inline = true;
