import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'shared/components/Link/Link';

import { useUrl } from 'hooks/useUrl';
import { useGetPlaceholder, useGetTranslation } from '../helpers';
import { useJsonata } from '../hooks/useJsonata';

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
    const setStatesFromJsonata = async () => {
      const [nameRes, nameErr] = await jsonata(structure.resource?.name);
      const [namespaceRes, namespaceErr] = await jsonata(
        structure.resource?.namespace,
      );
      const [kindRes, kindErr] = await jsonata(structure.resource?.kind);
      setName(nameRes);
      setNameError(nameErr);
      setNamespace(namespaceRes);
      setNamespaceError(namespaceErr);
      setKind(kindRes);
      setKindError(kindErr);
    };
    setStatesFromJsonata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    structure.resource?.name,
    structure.resource?.namespace,
    structure.resource?.kind,
    originalResource,
    singleRootResource,
    embedResource,
    scope,
    value,
    arrayItems,
    jsonata,
  ]);

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
    <Link
      url={resourceUrl(
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
