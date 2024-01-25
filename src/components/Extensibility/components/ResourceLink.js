import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Link } from '@ui5/webcomponents-react';
import { useSetRecoilState } from 'recoil';

import { useUrl } from 'hooks/useUrl';
import { useGetPlaceholder, useGetTranslation } from '../helpers';
import { useJsonata } from '../hooks/useJsonata';
import { columnLayoutState } from 'state/columnLayoutAtom';

export function ResourceLink({
  value,
  structure,
  originalResource,
  scope,
  arrayItems,
  singleRootResource,
  embedResource,
}) {
  const { t } = useTranslation();
  const { t: tExt } = useGetTranslation();
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  const { resourceUrl } = useUrl();
  const navigate = useNavigate();

  const setLayoutColumn = useSetRecoilState(columnLayoutState);

  const jsonata = useJsonata({
    resource: originalResource,
    parent: singleRootResource,
    embedResource: embedResource,
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
      onClick={() => {
        setLayoutColumn({
          midColumn: null,
          endColumn: null,
          layout: 'OneColumn',
        });

        navigate(
          resourceUrl(
            {
              kind,
              metadata: {
                name,
              },
            },
            { namespace },
          ),
        );
      }}
    >
      {tExt(value)}
    </Link>
  );
}

ResourceLink.inline = true;
