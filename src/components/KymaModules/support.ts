import pluralize from 'pluralize';
import React, { useEffect, useState } from 'react';

import { useFetch } from 'shared/hooks/BackendAPI/useFetch';

type KymaResourceType = {
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

export const findStatus = (
  kymaResource: KymaResourceType,
  moduleName: string,
) => {
  console.log(
    kymaResource?.status?.modules?.find(
      (module: { name: string }) => moduleName === module.name,
    ),
  );
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
