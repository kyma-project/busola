import pluralize from 'pluralize';
import { useEffect, useState } from 'react';

import { useFetch } from 'shared/hooks/BackendAPI/useFetch';

export function useModuleStatus(resource: any) {
  const fetch = useFetch();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const path = resource?.resource?.metadata?.namespace
    ? `/apis/${resource?.resource?.apiVersion}/namespaces/${
        resource?.resource?.metadata?.namespace
      }/${pluralize(resource?.resource?.kind || '').toLowerCase()}/${
        resource?.resource?.metadata?.name
      }`
    : `/apis/${resource?.resource?.apiVersion}/${pluralize(
        resource?.resource?.kind || '',
      ).toLowerCase()}/${resource?.resource?.metadata?.name}`;

  useEffect(() => {
    async function fetchModule() {
      try {
        const response = await fetch({ relativeUrl: path });
        const status = (await response.json())?.status;
        setData(status);
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchModule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return { data: data, loading: loading, error: error };
}
