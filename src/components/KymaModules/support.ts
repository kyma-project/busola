import pluralize from 'pluralize';
import React, { useEffect, useState } from 'react';

import { useFetch } from 'shared/hooks/BackendAPI/useFetch';

type KymaResourceType = {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
  };
  spec: {
    modules: {
      name: string;
    }[];
  };
  status: {
    modules: {
      name: string;
    }[];
  };
};

export function useModuleStatus(resource: KymaResourceType) {
  const fetch = useFetch();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const path = resource?.metadata?.namespace
    ? `/apis/${resource?.apiVersion}/namespaces/${
        resource?.metadata?.namespace
      }/${pluralize(resource?.kind || '').toLowerCase()}/${
        resource?.metadata?.name
      }`
    : `/apis/${resource?.apiVersion}/${pluralize(
        resource?.kind || '',
      ).toLowerCase()}/${resource?.metadata?.name}`;

  useEffect(() => {
    async function fetchModule() {
      if (!resource) return;
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

  return { data, loading, error };
}

export const findStatus = (
  kymaResource: KymaResourceType,
  moduleName: string,
) => {
  return kymaResource?.status?.modules?.find(
    (module: { name: string }) => moduleName === module.name,
  );
};

export const findSpec = (
  kymaResource: KymaResourceType,
  moduleName: string,
) => {
  return kymaResource?.spec.modules?.find(
    (module: { name: string }) => moduleName === module.name,
  );
};

export const setChannel = (
  module: { name: string },
  channel: string,
  index: number,
  selectedModules: {
    name: string;
    channel?: string;
  }[],
  setSelectedModules: React.Dispatch<React.SetStateAction<any[]>>,
) => {
  const modulesToUpdate = [...selectedModules];
  if (
    selectedModules.find(
      (selectedModule: { name: string }) => selectedModule.name === module.name,
    )
  ) {
    if (channel === 'predefined') {
      delete modulesToUpdate[index].channel;
    } else modulesToUpdate[index].channel = channel;
  } else {
    modulesToUpdate.push({
      name: module.name,
    });
    if (channel !== 'predefined')
      modulesToUpdate[modulesToUpdate?.length - 1].channel = channel;
  }
  setSelectedModules(modulesToUpdate);
};
