import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { getUrl } from 'resources/Namespaces/YamlUpload/useUploadResources';

import {
  ConditionType,
  DEFAULT_K8S_NAMESPACE,
  getResourcePath,
  KymaResourceType,
  ModuleManagerType,
  ModuleTemplateListType,
  ModuleTemplateStatus,
  ModuleTemplateType,
} from './support';
import {
  getInstalledModules,
  getNotInstalledModules,
  postForCommunityResources,
} from 'components/Modules/community/communityModulesHelpers';
import { allNodesAtom } from 'state/navigation/allNodesAtom';
import { HttpError } from 'shared/hooks/BackendAPI/config';
import { PostFn } from 'shared/hooks/BackendAPI/usePost';
import { useTranslation } from 'react-i18next';

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

  // Create a stable key based on module names
  const modulesKey = useMemo(() => {
    if (!modules || modules.length === 0) return '';
    return modules
      .map((m) => m?.resource?.metadata?.name ?? m?.metadata?.name ?? m?.name)
      .filter(Boolean)
      .join(',');
  }, [modules]);

  useEffect(() => {
    async function fetchModules() {
      if (!modules || modules.length === 0) return;
      setLoading(true);
      try {
        const results = await Promise.all(
          modules.map(async (module) => {
            const resource = module?.resource ?? module;

            if (!resource || (!resource?.apiVersion && !resource?.group))
              return null;
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
  }, [modulesKey]);

  return { data, loading, error };
}

export const useFetchModuleData = (
  moduleTemplates: ModuleTemplateListType,
  selector: (_: ModuleTemplateType) => any,
  label: string,
  moduleTemplatesLoading?: boolean,
  pollingInterval?: number,
) => {
  const [data, setData] = useState<Record<string, any>>({});
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(true);
  const fetch = useFetch();
  const singleGetFn = useSingleGet();
  const isFetching = useRef(false);

  const clusterNodes = useAtomValue(allNodesAtom).filter(
    (node) => !node.namespaced,
  );
  const namespaceNodes = useAtomValue(allNodesAtom).filter(
    (node) => node.namespaced,
  );

  const fetchAll = useCallback(
    async (isPolling: boolean = false) => {
      if (isFetching.current) {
        return;
      }

      const items = moduleTemplates?.items ?? [];

      if (!items.length) {
        if (!isPolling) {
          setData({});
          setLoading(false);
        }
        return;
      }

      isFetching.current = true;
      setError(null);
      const cache: Record<string, any> = {};
      const errors: string[] = [];

      const results = await Promise.allSettled(
        items.map(async (moduleTemplate) => {
          const name = moduleTemplate?.metadata?.name;
          const resource = selector(moduleTemplate);

          if (!name || !resource) {
            return { name, data: null };
          }

          try {
            const resourceUrl = await getUrl(
              resource,
              resource?.metadata?.namespace ||
                resource?.namespace ||
                DEFAULT_K8S_NAMESPACE,
              clusterNodes,
              namespaceNodes,
              singleGetFn,
            );
            const url = `${resourceUrl}/${
              resource?.metadata?.name || resource?.name
            }`;
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
            cache[`${name}:${result.value.data.metadata.namespace}`] = data;
          }
        }
      }

      // Don't clear data during polling if all fetches fail
      if (Object.keys(cache).length > 0 || !isPolling) {
        setData(cache);
      }
      if (errors.length) setError(errors.join('\n'));
      setLoading(false);
      isFetching.current = false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [moduleTemplates, clusterNodes, namespaceNodes],
  );

  useEffect(() => {
    if (moduleTemplatesLoading) {
      return;
    }

    fetchAll(false);

    if (pollingInterval && pollingInterval > 0) {
      const intervalId = setInterval(() => fetchAll(true), pollingInterval);
      return () => clearInterval(intervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleTemplates, moduleTemplatesLoading, pollingInterval]);

  const getItem = useCallback(
    (name: string, namespace: string) => data[`${name}:${namespace}`],
    [data],
  );

  return { loading, error, data, getItem };
};

const COMMUNITY_MODULES_POLLING_INTERVAL = 5000; // 5 seconds

export const useGetInstalledNotInstalledModules = (
  moduleTemplates: ModuleTemplateListType,
  moduleTemplatesLoading?: boolean,
): {
  installed: ModuleTemplateListType;
  notInstalled: ModuleTemplateListType;
  installedVersions: Map<string, string>;
  loading: boolean;
  error?: string | null;
} => {
  const {
    data: managers,
    loading,
    error,
  } = useFetchModuleData(
    moduleTemplates,
    (module: ModuleTemplateType) => module?.spec?.manager ?? null,
    'manager',
    moduleTemplatesLoading,
    COMMUNITY_MODULES_POLLING_INTERVAL,
  );

  if (moduleTemplatesLoading) {
    return {
      installed: { items: [] },
      notInstalled: { items: [] },
      installedVersions: new Map(),
      loading: true,
      error: null,
    };
  }
  if (!moduleTemplates) {
    return {
      installed: { items: [] },
      notInstalled: { items: [] },
      installedVersions: new Map(),
      loading: false,
      error: null,
    };
  }

  const { items: installedItems, installedVersions } = getInstalledModules(
    moduleTemplates,
    managers,
  );
  const notInstalled = getNotInstalledModules(moduleTemplates, managers);

  return {
    installed: { items: installedItems },
    notInstalled,
    installedVersions,
    loading,
    error,
  };
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

          const allNotTrue = status?.conditions?.filter(
            (condition: ConditionType) => condition?.status !== 'True',
          );
          if (allNotTrue.length !== 0) {
            const latestCondition = allNotTrue.reduce(
              (acc: ConditionType, condition: ConditionType) =>
                new Date(acc?.lastUpdateTime).getTime() >
                new Date(condition?.lastUpdateTime).getTime()
                  ? acc
                  : condition,
              {},
            );
            if (latestCondition?.type) {
              setData({
                type: latestCondition.type,
                status: latestCondition.status,
                message: latestCondition.message,
              });
              return;
            }
          }
          setData({
            state: 'Ready',
            message: 'All manager conditions are true',
          });
          return;
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

export function useGetYAMLModuleTemplates(sourceURL: string, post: PostFn) {
  const { t } = useTranslation();
  const [resources, setResources] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const filterResources = (resources: any) => {
    return (resources || []).filter(
      (resource: any) =>
        resource?.kind === 'ModuleTemplate' ||
        (resource?.kind === 'CustomResourceDefinition' &&
          resource?.metadata?.name ===
            'moduletemplates.operator.kyma-project.io'),
    );
  };

  useEffect(() => {
    setLoading(true);
    if (!sourceURL) {
      setResources([]);
      setError(null);
      setLoading(false);

      return;
    }

    if (sourceURL.endsWith('.yaml')) {
      (async function () {
        setLoading(true);
        try {
          const allResources = await postForCommunityResources(post, sourceURL);
          const allowedToApply = filterResources(allResources);
          const formatted = allowedToApply?.map((r: any) => {
            return { value: r };
          });

          setError(null);

          setResources(formatted);
        } catch (e) {
          if (e instanceof HttpError) {
            setResources([]);
            setError(t('modules.community.messages.source-yaml-invalid-url'));
          }
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setResources([]);

      setError(t('modules.community.messages.source-yaml-invalid-url'));
      setLoading(false);
    }
  }, [sourceURL]); // eslint-disable-line react-hooks/exhaustive-deps

  return { resources, error, loading };
}
