import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import {
  ConditionType,
  getResourcePath,
  KymaResourceType,
  ModuleManagerType,
  ModuleTemplateListType,
  ModuleTemplateStatus,
  ModuleTemplateType,
} from './support';
import { isEqual } from 'lodash';

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

export const useFetchModuleData = (
  moduleTemplates: ModuleTemplateListType,
  selector: Function,
  label: string,
) => {
  const [data, setData] = useState<Record<string, any>>({});
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(true);
  const fetch = useFetch();

  const prevTemplateNamesRef = useRef<string[]>([]);

  useEffect(() => {
    const items = moduleTemplates?.items ?? [];

    const currentNames = items.map(m => m?.metadata?.name).sort();

    if (isEqual(prevTemplateNamesRef.current, currentNames)) {
      return;
    }

    prevTemplateNamesRef.current = currentNames;

    if (!items.length) {
      setData({});
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      const cache: Record<string, any> = {};
      const errors: string[] = [];

      const results = await Promise.allSettled(
        items.map(async module => {
          const name = module?.metadata?.name;
          const resource = selector(module);

          if (!name || !resource) {
            return { name, data: null };
          }

          try {
            const url = getResourcePath(resource);

            const response = await fetch({ relativeUrl: url });
            const data = await response.json();

            return { name, data };
          } catch (e) {
            errors.push(
              `Error fetching ${label} for module "${name}": ${
                e instanceof Error ? e.message : 'Unknown error'
              }`,
            );
            return { name, data: null };
          }
        }),
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { name, data } = result.value || {};
          if (name && data) {
            cache[name] = data;
          }
        }
      }

      setData(cache);
      if (errors.length) setError(errors.join('\n'));
      setLoading(false);
    };

    fetchAll();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleTemplates]);

  const getItem = useCallback((name: string) => data[name], [data]);

  return { loading, error, data, getItem };
};

export const useGetInstalledModules = (
  moduleTemplates: ModuleTemplateListType,
  skip?: boolean,
) => {
  const { data: managers, loading, error } = useFetchModuleData(
    moduleTemplates,
    (module: ModuleTemplateType) => module?.spec?.manager ?? null,
    'manager',
  );

  if (skip || !moduleTemplates) {
    return { installed: [], loading: true, error: null };
  }

  const filtered = moduleTemplates.items?.filter(
    module => !!managers[module.metadata.name],
  );

  const installed =
    filtered?.map(module => ({
      name: module.metadata.name,
      version: module.spec.version,
      resource: module.spec.data,
    })) ?? [];

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

export const useGetModuleResource = (resource: any) => {
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
        setData(moduleResource);
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
