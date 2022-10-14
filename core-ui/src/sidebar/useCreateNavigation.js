import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useEffect, useRef } from 'react';
import { useFetchPermissions } from 'sidebar/useFetchPermissions';
import { useFetchExtensions } from 'sidebar/useFetchExtensions';

export const useCreateNavigation = () => {
  const cos = useMicrofrontendContext();

  const { activeClusterName, authData, features } = cos;

  const fetchPermissions = useFetchPermissions();
  const fetchExtensions = useFetchExtensions();

  const lastFetched = useRef(null);
  console.log(2222, features);
  useEffect(() => {
    //* normal condition to break
    const isOngoingClusterChange = !activeClusterName || !authData;
    if (isOngoingClusterChange) {
      return;
    }

    //* luigi condition to break
    // Luigi updates authData a few times during a cluster load. The below line cancels repeated requests after the first fetch
    if (lastFetched.current === activeClusterName) return;
    lastFetched.current = activeClusterName;

    //* mainFn
    const effectFn = async () => {
      //* permissionSet
      const permissionSet = await fetchPermissions();
      console.log(1111, permissionSet);
    };

    void effectFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClusterName, authData, features]);
};
