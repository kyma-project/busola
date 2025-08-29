import { useEffect, useState } from 'react';
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

  const [name, setName] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [namespace, setNamespace] = useState(null);
  const [namespaceError, setNamespaceError] = useState(null);
  const [kind, setKind] = useState(null);
  const [kindError, setKindError] = useState(null);

  useEffect(() => {
    if (!value) {
      return;
    }
    jsonata(structure.resource?.name).then(([res, error]) => {
      setName(res);
      setNameError(error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure.resource?.name]);
  useEffect(() => {
    jsonata(structure.resource?.namespace).then(([res, error]) => {
      setNamespace(res);
      setNamespaceError(error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure.resource?.namespace]);
  useEffect(() => {
    jsonata(structure.resource?.kind).then(([res, error]) => {
      setKind(res);
      setKindError(error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure.resource?.kind]);

  if (!value) {
    return emptyLeafPlaceholder;
  }

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
