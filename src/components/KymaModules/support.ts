import pluralize from 'pluralize';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { ColumnLayoutState } from 'state/columnLayoutAtom';
import { resolveType } from './components/ModuleStatus';

export const enum ModuleTemplateStatus {
  Ready = 'Ready',
  Processing = 'Processing',
  Deleting = 'Deleting',
  Unknown = 'Unknown',
  Unmanaged = 'Unmanaged',
  Warning = 'Warning',
  Error = 'Error',
  NotInstalled = 'Not installed',
}

type ConditionType = {
  lastTransitionTime: string;
  lastUpdateTime: string;
  message: string;
  reason: string;
  status: string;
  type: string;
};

export type KymaResourceSpecModuleType = {
  name: string;
  channel?: string;
};

export type KymaResourceStatusModuleType = {
  name: string;
  channel?: string;
  version?: string;
  state?: string;
  resource?: {
    apiVersion?: string;
    metadata?: { name: string; namespace?: string };
    kind?: string;
  };
  message?: string;
};

export type KymaResourceType = {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
  };
  spec: {
    channel: string;
    modules: KymaResourceSpecModuleType[];
  };
  status: {
    modules: KymaResourceStatusModuleType[];
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

export function useGetAllModulesStatuses(modules: any[]) {
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
                status: status?.state || ModuleTemplateStatus.Unknown,
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
    (module: { name: string }) => moduleName === module?.name,
  );
};

export const findModuleSpec = (
  kymaResource: KymaResourceType,
  moduleName: string,
) => {
  return kymaResource?.spec.modules?.find(
    (module: { name: string }) => moduleName === module?.name,
  );
};

type ModuleManagerType = {
  name: string;
  namespace: string;
  group: string;
  version: string;
  kind: string;
};

export type ModuleTemplateType = {
  metadata: {
    name: string;
    namespace: string;
    labels: Record<string, string>;
    annotations: Record<string, string>;
  };
  spec: {
    associatedResources: any;
    data: any;
    channel: string;
    version: string;
    info?: {
      documentation?: string;
    };
    manager: ModuleManagerType;
  };
};

export type ModuleTemplateListType = {
  items: ModuleTemplateType[];
};

export const findModuleTemplate = (
  moduleTemplates: ModuleTemplateListType,
  moduleName: string,
  channel: string,
  version: string,
) => {
  // This change was made due to changes in moduleTemplates and should be simplified once all moduleTemplates migrate
  const moduleTemplateWithoutInfo = moduleTemplates?.items?.find(
    moduleTemplate =>
      moduleName ===
        moduleTemplate.metadata.labels[
          'operator.kyma-project.io/module-name'
        ] && moduleTemplate.spec.channel === channel,
  );
  const moduleWithInfo = moduleTemplates?.items?.find(
    moduleTemplate =>
      moduleName ===
        moduleTemplate.metadata.labels[
          'operator.kyma-project.io/module-name'
        ] &&
      !moduleTemplate.spec.channel &&
      moduleTemplate.spec.version === version,
  );

  return moduleWithInfo ?? moduleTemplateWithoutInfo;
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

export const checkSelectedModule = (
  module: { name: string },
  layoutState: ColumnLayoutState,
) => {
  // Checking if this is the selected module after a refresh or other case after which we have undefined.
  if (
    window.location.href.includes('kymamodules') &&
    layoutState?.midColumn?.resourceType
  ) {
    const [resourceTypeBase] = layoutState.midColumn.resourceType.split('.');
    return pluralize(module?.name?.replace('-', '') || '') === resourceTypeBase;
  }
  return false;
};

export const useGetManager = moduleTemplates => {
  const managerCacheRef = useRef({});
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetch = useFetch();

  useEffect(() => {
    const fetchManagers = async () => {
      setLoading(true);

      if (!moduleTemplates?.items?.length) {
        setLoading(false);
        return;
      }

      const cache = {};

      await Promise.all(
        moduleTemplates.items.map(async module => {
          const name = module?.metadata?.name;
          const manager = module?.spec?.manager;

          if (!manager || !name) return;

          try {
            const url = `/apis/${manager.group}/v1/namespaces/${
              module.metadata.namespace
            }/${pluralize(manager.kind).toLowerCase()}/${manager.name}`;
            const response = await fetch({ relativeUrl: url });
            const data = await response.json();

            if (data) {
              cache[name] = data;
            }
          } catch (e) {
            setError(`Error fetching manager for module "${name}":`, e);
          }
        }),
      );
      managerCacheRef.current = cache;
      setLoading(false);
    };

    fetchManagers();
  }, [moduleTemplates]);

  const getManager = useCallback(name => {
    return managerCacheRef.current[name];
  }, []);

  return { getManager, loading, error, managerCacheRef };
};

export const useGetInstalledModules = moduleTemplates => {
  const { managerCacheRef, loading, error } = useGetManager(moduleTemplates);

  const filtered = moduleTemplates?.items?.filter(
    module => !!managerCacheRef?.current[module.metadata.name],
  );
  const installed =
    filtered?.map(module => {
      return {
        name: module?.metadata?.name,
        version: module?.spec?.version,
        resource: module?.spec?.data,
      };
    }) ?? [];

  return { installed, loading, error };
};

export function useGetManagerStatus(manager?: ModuleManagerType) {
  const fetch = useFetch();
  const [data, setData] = useState<any>({
    state: ModuleTemplateStatus.Unknown,
    message: null,
  });
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (manager) {
      const path = getResourcePath({
        apiVersion: `${manager?.group}/${manager?.version}`,
        kind: manager?.kind,
        metadata: {
          name: manager?.name,
          namespace: manager?.namespace,
        },
      } as KymaResourceType);
      async function fetchResource() {
        try {
          const response = await fetch({ relativeUrl: path });
          const status = (await response.json())?.status;

          if (status.state) {
            setData({ state: status.state, message: status?.message });
            return;
          }

          const latest = status?.conditions
            ?.filter((condition: ConditionType) => condition?.status === 'True')
            ?.reduce(
              (acc: ConditionType, condition: ConditionType) =>
                new Date(acc?.lastUpdateTime).getTime() >
                new Date(condition?.lastUpdateTime).getTime()
                  ? acc
                  : condition,
              {},
            );
          if (latest?.type) {
            setData({ state: latest.type, message: latest.message });
          }
        } catch (error) {
          if (error instanceof Error) {
            setError(error);
          }
        }
      }

      fetchResource();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manager]);

  return { data, error };
}

export const resolveInstallationStateName = (
  state?: string,
  managerExists?: boolean,
  managerResourceState?: string,
) => {
  if (state === ModuleTemplateStatus.Unmanaged && !managerExists) {
    return ModuleTemplateStatus.NotInstalled;
  }

  if (state === ModuleTemplateStatus.Unmanaged && managerExists) {
    if (resolveType(state) !== resolveType(managerResourceState ?? '')) {
      return ModuleTemplateStatus.Processing;
    }
    return managerResourceState || ModuleTemplateStatus.Unknown;
  }

  return state || ModuleTemplateStatus.Unknown;
};

export const useGetModuleResource = resource => {
  const fetch = useFetch();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const path = getResourcePath(resource);

  useEffect(() => {
    async function fetchResource() {
      if (!resource) return;
      try {
        const response = await fetch({ relativeUrl: path });
        const moduleResource = await response.json();
        setData(moduleResource.data);
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchResource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return { data, loading, error };
};
