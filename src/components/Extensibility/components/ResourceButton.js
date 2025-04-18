import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useUrl } from 'hooks/useUrl';
import { Button } from '@ui5/webcomponents-react';

import { useGetPlaceholder, useGetTranslation } from '../helpers';
import { useJsonata } from '../hooks/useJsonata';

export function ResourceButton({
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
  const { resourceUrl, clusterUrl } = useUrl();
  const navigate = useNavigate();

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
  const customUrl = structure.resource?.customUrl;

  const jsonataError = nameError || namespaceError || kindError;
  if (jsonataError) {
    return t('extensibility.configuration-error', {
      error: jsonataError.message,
    });
  }

  return (
    <Button
      design="Emphasized"
      endIcon={structure?.icon}
      inline={true}
      onClick={() =>
        navigate(
          customUrl
            ? clusterUrl(customUrl)
            : resourceUrl(
                {
                  kind,
                  metadata: {
                    name,
                  },
                },
                { namespace },
              ),
        )
      }
    >
      {tExt(value)}
    </Button>
  );
}
