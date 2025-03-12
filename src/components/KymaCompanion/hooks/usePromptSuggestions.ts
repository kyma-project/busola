import { useState, useEffect, useRef } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { sessionIDState } from '../../../state/companion/sessionIDAtom';
import getPromptSuggestions from '../api/getPromptSuggestions';
import { ColumnLayoutState, columnLayoutState } from 'state/columnLayoutAtom';
import { prettifyNameSingular } from 'shared/utils/helpers';
import { usePost } from 'shared/hooks/BackendAPI/usePost';

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
    resourceType: prettifyNameSingular(column?.resourceType ?? ''),
    groupVersion: column?.apiGroup
      ? `${column?.apiGroup}/${column?.apiVersion}`
      : column?.apiVersion ?? '',
    resourceName: column?.resourceName ?? '',
  };
};

export function usePromptSuggestions(options?: { skip?: boolean }) {
  const post = usePost();
  const [initialSuggestions, setInitialSuggestions] = useState<string[]>([]);
  const setSessionID = useSetRecoilState(sessionIDState);
  const columnLayout = useRecoilValue(columnLayoutState);
  const [loading, setLoading] = useState(true);
  const fetchedResourceRef = useRef('');
  const [currentResource, setCurrentResource] = useState<CurrentResource>({
    namespace: '',
    resourceName: '',
    resourceType: '',
    groupVersion: '',
  });

  useEffect(() => {
    const {
      namespace,
      resourceType,
      groupVersion,
      resourceName,
    } = getResourceFromColumnnLayout(columnLayout);

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

    const {
      namespace,
      resourceType,
      resourceName,
      groupVersion,
    } = currentResource;
    const resourceKey = `${namespace}|${resourceType}|${groupVersion}|${resourceName}`.toLocaleLowerCase();

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
        });
        if (result) {
          setInitialSuggestions(result.promptSuggestions);
          setSessionID(result.conversationId);
        }
      } finally {
        setLoading(false);
      }
    }

    if (resourceType && fetchedResourceRef.current !== resourceKey) {
      fetchedResourceRef.current = resourceKey;
      fetchSuggestions();
    }
  }, [currentResource, options?.skip, post, setSessionID]);

  return {
    initialSuggestions,
    initialSuggestionsLoading: loading,
    currentResource,
  };
}
