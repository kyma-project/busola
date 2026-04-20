import { useState, useEffect, useRef } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { sessionIDAtom } from '../../../state/companion/sessionIDAtom';
import getPromptSuggestions from '../api/getPromptSuggestions';
import { ColumnLayoutState, columnLayoutAtom } from 'state/columnLayoutAtom';
import { prettifyNameSingular } from 'shared/utils/helpers';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { authDataAtom } from 'state/authDataAtom';
import { clusterAtom } from 'state/clusterAtom';

interface CurrentResource {
  resourceName: string;
  resourceType: string;
  namespace: string;
  groupVersion: string;
}

const getResourceFromColumnnLayout = (
  columnLayout: ColumnLayoutState,
): CurrentResource => {
  const column =
    columnLayout?.endColumn ??
    columnLayout?.midColumn ??
    columnLayout?.startColumn;
  return {
    namespace: column?.namespaceId ?? '',
    resourceType:
      prettifyNameSingular(column?.rawResourceTypeName ?? '') ||
      prettifyNameSingular(column?.resourceType ?? ''),
    groupVersion: column?.apiGroup
      ? `${column?.apiGroup}/${column?.apiVersion}`
      : (column?.apiVersion ?? ''),
    resourceName: column?.resourceName ?? '',
  };
};

export function usePromptSuggestions(
  isReset: boolean,
  setIsReset: React.Dispatch<React.SetStateAction<boolean>>,
  options?: {
    skip?: boolean;
  },
) {
  const post = usePost();
  const authData = useAtomValue<any>(authDataAtom);
  const cluster = useAtomValue<any>(clusterAtom);
  const [initialSuggestions, setInitialSuggestions] = useState<string[]>([]);
  const setSessionID = useSetAtom(sessionIDAtom);
  const columnLayout = useAtomValue(columnLayoutAtom);
  const [loading, setLoading] = useState(true);
  const fetchedResourceRef = useRef('');
  const [currentResource, setCurrentResource] = useState<CurrentResource>({
    namespace: '',
    resourceName: '',
    resourceType: '',
    groupVersion: '',
  });

  useEffect(() => {
    const { namespace, resourceType, groupVersion, resourceName } =
      getResourceFromColumnnLayout(columnLayout);

    setCurrentResource({
      namespace,
      resourceName,
      resourceType,
      groupVersion,
    });
  }, [columnLayout]);

  useEffect(() => {
    if (options?.skip) {
      return;
    }

    const { namespace, resourceType, resourceName, groupVersion } =
      currentResource;
    const resourceKey =
      `${namespace}|${resourceType}|${groupVersion}|${resourceName}`.toLocaleLowerCase();

    async function fetchSuggestions() {
      setLoading(true);
      setInitialSuggestions([]);
      try {
        const result = await getPromptSuggestions({
          post,
          namespace: namespace,
          resourceType: resourceType,
          groupVersion: groupVersion,
          resourceName: resourceName,
          clusterUrl: cluster?.currentContext?.cluster?.cluster?.server,
          certificateAuthorityData:
            cluster?.currentContext?.cluster?.cluster?.[
              'certificate-authority-data'
            ],
          clusterAuth: {
            token: authData?.token,
            clientCertificateData: authData?.['client-certificate-data'],
            clientKeyData: authData?.['client-key-data'],
          },
        });
        if (result) {
          setInitialSuggestions(result.promptSuggestions);
          setSessionID(result.conversationId);
        }
      } finally {
        setLoading(false);
      }
    }

    if (
      resourceType &&
      (fetchedResourceRef.current !== resourceKey || isReset)
    ) {
      fetchedResourceRef.current = resourceKey;
      fetchSuggestions();
      setIsReset(false);
    }
  }, [
    currentResource,
    options?.skip,
    post,
    setSessionID,
    isReset,
    setIsReset,
    authData,
    cluster,
  ]);

  return {
    initialSuggestions,
    initialSuggestionsLoading: loading,
    currentResource,
  };
}
