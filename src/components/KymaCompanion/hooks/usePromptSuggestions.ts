import { useState, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { sessionIDState } from '../../../state/companion/sessionIDAtom';
import { clusterState } from 'state/clusterAtom';
import getPromptSuggestions from '../api/getPromptSuggestions';
import { ColumnLayoutState, columnLayoutState } from 'state/columnLayoutAtom';
import { prettifyNameSingular } from 'shared/utils/helpers';

export function usePromptSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const setSessionID = useSetRecoilState(sessionIDState);
  const cluster = useRecoilValue(clusterState);
  const columnLayout = useRecoilValue(columnLayoutState);

  const getResourceFromColumnnLayout = (columnLayout: ColumnLayoutState) => {
    return {
      namespace: columnLayout.midColumn?.namespaceId ?? '',
      resourceType: prettifyNameSingular(
        columnLayout.midColumn?.resourceType ?? '',
      ),
      apiGroup: columnLayout.midColumn?.apiGroup ?? '',
      apiVersion: columnLayout.midColumn?.apiVersion ?? '',
      resourceName: columnLayout.midColumn?.resourceName ?? '',
    };
  };

  useEffect(() => {
    const userAuth = cluster?.currentContext.user.user;
    const {
      namespace,
      resourceType,
      apiGroup,
      apiVersion,
      resourceName,
    } = getResourceFromColumnnLayout(columnLayout);
    const groupVersion = apiGroup ? `${apiGroup}/${apiVersion}` : apiVersion;

    async function fetchSuggestions() {
      const sessionID = ''; // TODO
      setSessionID(sessionID);
      const promptSuggestions = await getPromptSuggestions({
        namespace: namespace,
        resourceType: resourceType,
        groupVersion: groupVersion,
        resourceName: resourceName,
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

    if (cluster && resourceType && groupVersion && suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [cluster, columnLayout, suggestions, setSessionID]);

  return suggestions;
}
