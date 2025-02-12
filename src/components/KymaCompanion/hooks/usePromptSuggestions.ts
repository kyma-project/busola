import { useState, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { sessionIDState } from '../../../state/companion/sessionIDAtom';
import { clusterState } from 'state/clusterAtom';
import getPromptSuggestions from '../api/getPromptSuggestions';
import { currentResourceState } from 'state/companion/currentResourceAtom';

export function usePromptSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const setSessionID = useSetRecoilState(sessionIDState);
  const cluster = useRecoilValue(clusterState);
  const currentResource = useRecoilValue(currentResourceState);

  useEffect(() => {
    const userAuth = cluster?.currentContext.user.user;

    async function fetchSuggestions() {
      const sessionID = ''; // TODO
      setSessionID(sessionID);
      const promptSuggestions = await getPromptSuggestions({
        namespace: currentResource.namespace,
        resourceType: currentResource.resourceType,
        groupVersion: currentResource.groupVersion,
        resourceName: currentResource.resourceName,
        clusterUrl: cluster?.currentContext.cluster.cluster.server ?? '',
        token: userAuth && 'token' in userAuth ? userAuth.token : '', // TODO
        certificateAuthorityData:
          cluster?.currentContext.cluster.cluster[
            'certificate-authority-data'
          ] ?? '',
      });
      if (promptSuggestions) {
        setSuggestions(promptSuggestions);
      }
    }

    if (
      cluster &&
      currentResource.resourceType &&
      currentResource.groupVersion &&
      suggestions.length === 0
    ) {
      fetchSuggestions();
    }
  }, [cluster, currentResource, suggestions, setSessionID]);

  return suggestions;
}
