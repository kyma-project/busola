import { useState, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { sessionIDState } from '../../../state/companion/sessionIDAtom';
import getPromptSuggestions from '../api/getPromptSuggestions';
import { ColumnLayoutState, columnLayoutState } from 'state/columnLayoutAtom';
import { prettifyNameSingular } from 'shared/utils/helpers';
import { usePost } from 'shared/hooks/BackendAPI/usePost';

export function usePromptSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const setSessionID = useSetRecoilState(sessionIDState);
  const columnLayout = useRecoilValue(columnLayoutState);
  const post = usePost();

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

  useEffect(() => {
    const {
      namespace,
      resourceType,
      apiGroup,
      apiVersion,
      resourceName,
    } = getResourceFromColumnnLayout(columnLayout);
    const groupVersion = apiGroup ? `${apiGroup}/${apiVersion}` : apiVersion;

    async function fetchSuggestions() {
      const result = await getPromptSuggestions({
        post,
        namespace: namespace,
        resourceType: resourceType,
        groupVersion: groupVersion,
        resourceName: resourceName,
      });
      if (result) {
        setSuggestions(result.promptSuggestions);
        setSessionID(result.conversationId);
      }
    }

    if (resourceType && suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [columnLayout, suggestions, post, setSessionID]);

  return suggestions;
}
