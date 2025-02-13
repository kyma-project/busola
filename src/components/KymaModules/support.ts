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

const getResourcePath = (resource: KymaResourceType) => {
  if (!resource) return '';
  return resource?.metadata?.namespace
    ? `/apis/${resource?.apiVersion}/namespaces/${
        resource?.metadata?.namespace
      }/${pluralize(resource?.kind || '').toLowerCase()}/${
        resource?.metadata?.name
      }`
    : `/apis/${resource?.apiVersion}/${pluralize(
        resource?.kind || '',
      ).toLowerCase()}/${resource?.metadata?.name}`;
};

export function useModuleStatus(resource: KymaResourceType) {
  const fetch = useFetch();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const path = getResourcePath(resource);

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

export function useModulesStatuses(modules: any[]) {
  const fetch = useFetch();
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchModules() {
      if (!modules || modules.length === 0) return;
      setLoading(true);
      try {
        const results = await Promise.all(
          modules.map(async module => {
            const resource = module?.resource ?? module;

            if (!resource) return null;
            const path = getResourcePath(resource);

            try {
              const response = await fetch({ relativeUrl: path });
              const status = (await response.json())?.status;
              return {
                key: resource?.metadata?.name ?? resource?.name,
                status: status?.state || 'Unknown',
              };
            } catch (e) {
              return {
                key: resource?.metadata?.name ?? resource?.name,
                status: null,
                error: e,
              };
            }
          }),
        );

        setData(results);
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(modules)]);

  return { data, loading, error };
}

export const findModuleStatus = (
  kymaResource: KymaResourceType,
  moduleName: string,
) => {
  return kymaResource?.status?.modules?.find(
    (module: { name: string }) => moduleName === module.name,
  );
};

export const findModuleSpec = (
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
