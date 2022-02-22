import { useEffect, useState } from 'react';
import { useSingleGet } from 'react-shared';

export function useIsSKR() {
  const fetch = useSingleGet();

  const [isSkr, setSkr] = useState(null);
  useEffect(() => {
    const checkIfSKR = async () => {
      const response = await fetch(
        '/api/v1/namespaces/kyma-system/configmaps/skr-configmap',
      );
      const data = await response.json();

      setSkr(data.data?.['is-managed-kyma-runtime'] === 'true');
    };
    void checkIfSKR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isSkr;
}
