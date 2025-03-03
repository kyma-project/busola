import { useState, useEffect, useRef } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { sessionIDState } from '../../../state/companion/sessionIDAtom';
import getPromptSuggestions from '../api/getPromptSuggestions';
import { ColumnLayoutState, columnLayoutState } from 'state/columnLayoutAtom';
import { prettifyNameSingular } from 'shared/utils/helpers';
import { usePost } from 'shared/hooks/BackendAPI/usePost';

const getResourceFromColumnnLayout = (columnLayout: ColumnLayoutState) => {
  const column =
    columnLayout?.endColumn ??
    columnLayout?.midColumn ??
    columnLayout?.startColumn;
  return {
    namespace: column?.namespaceId ?? '',
    resourceType: prettifyNameSingular(column?.resourceType ?? ''),
    apiGroup: column?.apiGroup ?? '',
    apiVersion: column?.apiVersion ?? '',
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

  useEffect(() => {
    if (options?.skip) {
      return;
    }

    const {
      namespace,
      resourceType,
      apiGroup,
      apiVersion,
      resourceName,
    } = getResourceFromColumnnLayout(columnLayout);
    const groupVersion = apiGroup ? `${apiGroup}/${apiVersion}` : apiVersion;

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
  }, [columnLayout, options?.skip, post, setSessionID]);

  return { initialSuggestions, initialSuggestionsLoading: loading };
}
