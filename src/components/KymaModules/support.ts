import pluralize from 'pluralize';
import React, { useEffect, useState } from 'react';

import { useFetch } from 'shared/hooks/BackendAPI/useFetch';

export type KymaResourceSpecModuleType = {
  name: string;
  channel?: string;
};

export type KymaResourceStatusModuleType = {
  name: string;
  channel?: string;
  version?: string;
  state?: string;
  resource?: { metadata?: { namespace?: string }; kind?: string };
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
    (module: { name: string; version?: string; state?: string }) =>
      moduleName === module?.name,
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
