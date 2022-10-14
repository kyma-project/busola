import { useEffect, useRef, useState } from 'react';
import { useFetchExtensions } from 'sidebar/useFetchExtensions';
import { useRecoilValue } from 'recoil';
import { activeClusterNameState } from 'state/activeClusterNameAtom';
import { authDataState } from 'state/authDataAtom';
import { resources } from 'resources';

//update once per cluster load
export const useCreateCompleteNavList = () => {
  const activeClusterName = useRecoilValue(activeClusterNameState);
  const authData = useRecoilValue(authDataState);

  const [completeNavList, setCompleteNavList] = useState([]);

  const fetchExtensions = useFetchExtensions();

  const lastFetched = useRef(null);
  useEffect(() => {
    const isClusterCurrentlyChanging = !activeClusterName || !authData;
    const isAlreadyTriggered = lastFetched.current === activeClusterName;
    if (isClusterCurrentlyChanging || isAlreadyTriggered) {
      return;
    }
    lastFetched.current = activeClusterName;

    //* mainFn
    const effectFn = async () => {
      const resourceList = resources.map(resource => {
        const node = {};

        node.category = resource.category || 'temporary';
        node.resourceType = resource.resourceType.toLowerCase();
        node.pathSegment = (
          resource.pathSegment || resource.resourceType
        ).toLowerCase();
        node.label = resource.label || resource.resourceType;
        node.namespaced = resource.namespaced;

        return node;
      });

      //add:
      //extensibilityNodes
      //external nodes

      // create a complete list of nodes
      setCompleteNavList(resourceList);
    };

    void effectFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClusterName, authData, setCompleteNavList]);

  return { completeNavList };
};
