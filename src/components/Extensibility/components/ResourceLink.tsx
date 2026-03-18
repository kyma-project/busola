import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'shared/components/Link/Link';

import { useUrl } from 'hooks/useUrl';
import { useGetPlaceholder, useGetTranslation } from '../helpers';
import { useJsonata } from '../hooks/useJsonata';

interface ResourceLinkProps {
  value: any;
  structure: any;
  originalResource: any;
  scope: any;
  arrayItems: any;
  singleRootResource: any;
  embedResource: any;
}

export function ResourceLink({
  value,
  structure,
  originalResource,
  scope,
  arrayItems,
  singleRootResource,
  embedResource,
}: ResourceLinkProps) {
  const { t } = useTranslation();
  const { t: tExt } = useGetTranslation();
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  const { resourceUrl } = useUrl();
  const stableJsonataDeps = useMemo(
    () => ({
      resource: originalResource,
      parent: singleRootResource,
      embedResource: embedResource,
      scope,
      value,
      arrayItems,
    }),
    [
      originalResource,
      singleRootResource,
      embedResource,
      scope,
      value,
      arrayItems,
    ],
  );
  const jsonata = useJsonata(stableJsonataDeps);

  const [name, setName] = useState<string | null>(null);
  const [nameError, setNameError] = useState<any>(null);
  const [namespace, setNamespace] = useState<string | null>(null);
  const [namespaceError, setNamespaceError] = useState<any>(null);
  const [kind, setKind] = useState<string | null>(null);
  const [kindError, setKindError] = useState<any>(null);

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
    stableJsonataDeps,
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
