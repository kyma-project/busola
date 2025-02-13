import { useState, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { sessionIDState } from '../../../state/companion/sessionIDAtom';
import { clusterState } from 'state/clusterAtom';
import getPromptSuggestions from '../api/getPromptSuggestions';

export function usePromptSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const setSessionID = useSetRecoilState(sessionIDState);
  const cluster = useRecoilValue(clusterState);

  useEffect(() => {
    async function fetchSuggestions() {
      const sessionID = ''; // TODO
      setSessionID(sessionID);
      const promptSuggestions = await getPromptSuggestions({
        namespace: 'default', // TODO
        resourceType: 'deployment', // TODO
        groupVersion: 'apps/v1', // TODO
        resourceName: 'test-x', // TODO
        sessionID,
        clusterUrl: cluster?.currentContext.cluster.cluster.server ?? '',
        token: '', // TODO
        certificateAuthorityData:
          cluster?.currentContext.cluster.cluster[
            'certificate-authority-data'
          ] ?? '',
      });
      if (promptSuggestions) {
        setSuggestions(promptSuggestions);
      }
    }

    if (cluster && suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [cluster, suggestions, setSessionID]);

  return suggestions;
}
