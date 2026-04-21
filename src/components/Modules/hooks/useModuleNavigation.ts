import pluralize from 'pluralize';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router';
import { useUrl } from 'hooks/useUrl';
import { useGetScope } from 'shared/hooks/BackendAPI/useGet';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { extractApiGroupVersion } from 'resources/Roles/helpers';
import { columnLayoutAtom, ColumnState } from 'state/columnLayoutAtom';
import {
  createModulePartialPath,
  DEFAULT_K8S_NAMESPACE,
  findCrd,
  findExtension,
  findModuleTemplate,
  getResourceListPath,
  ModuleTemplateListType,
} from 'components/Modules/support';

type ModuleResource = {
  kind: string;
  apiVersion: string;
  metadata: { name: string; namespace: string };
};

type ModuleEntry = {
  name: string;
  channel?: string;
  version?: string;
  resource?: ModuleResource;
  template?: {
    apiVersion?: string;
    metadata?: { name: string; namespace?: string };
    kind?: string;
  };
  [key: string]: any;
};

type UseModuleNavigationOptions = {
  moduleTemplates: ModuleTemplateListType;
  extensions: any;
  crds: any;
  namespaced: boolean;
  installedModules: { name: string }[];
  setOpenedModuleIndex: (index: number) => void;
  setSelectedEntry?: (name: string) => void;
};

export function useModuleNavigation({
  moduleTemplates,
  extensions,
  crds,
  namespaced,
  installedModules,
  setOpenedModuleIndex,
  setSelectedEntry,
}: UseModuleNavigationOptions) {
  const navigate = useNavigate();
  const { clusterUrl, namespaceUrl } = useUrl();
  const setLayoutColumn = useSetAtom(columnLayoutAtom);
  const getScope = useGetScope();
  const fetch = useFetch();

  const hasDetailsLink = (resource: {
    name: string;
    resource?: { kind: string };
  }) => {
    const kind = resource?.resource?.kind ?? '';
    const hasExtension = !!findExtension(kind, extensions);
    const hasCrd = !!findCrd(kind, crds);
    return hasExtension || hasCrd;
  };

  const customColumnLayout = (resource: ModuleEntry) => {
    const kind = resource?.resource?.kind || '';
    return {
      resourceName: resource?.name,
      resourceType: pluralize(kind),
      rawResourceTypeName: kind,
      namespaceId: resource?.resource?.metadata?.namespace || '',
    };
  };

  const handleClickResource = async (
    moduleName: string,
    moduleStatus: ModuleEntry,
  ) => {
    if (!moduleStatus) return;

    let resource: ModuleResource;

    if (moduleStatus.resource) {
      resource = {
        kind: moduleStatus.resource.kind,
        apiVersion: moduleStatus.resource.apiVersion,
        metadata: { ...moduleStatus.resource.metadata },
      };
    } else {
      const connectedModule = findModuleTemplate(
        moduleTemplates,
        moduleName,
        moduleStatus.channel ?? '',
        moduleStatus.version ?? '',
        moduleStatus.template,
        moduleStatus?.namespace,
      );
      const moduleCr = connectedModule?.spec?.data;
      if (!moduleCr) return;

      resource = {
        kind: moduleCr.kind,
        apiVersion: moduleCr.apiVersion,
        metadata: {
          name: moduleCr.metadata?.name ?? '',
          namespace: moduleCr.metadata?.namespace ?? '',
        },
      };
    }

    const kind = resource.kind;
    const hasExtension = !!findExtension(kind, extensions);
    const moduleCrd = findCrd(kind, crds);
    if (!hasExtension && !moduleCrd) return;

    const { group, version } = extractApiGroupVersion(resource.apiVersion);

    let isNamespaced: boolean;
    try {
      isNamespaced = await getScope(group, version, kind);
    } catch {
      return;
    }

    setOpenedModuleIndex(
      installedModules.findIndex((entry) => entry.name === moduleName),
    );
    setSelectedEntry?.(moduleName);

    if (isNamespaced && !resource.metadata.namespace) {
      resource.metadata.namespace = DEFAULT_K8S_NAMESPACE;
    }

    const listPath = getResourceListPath(resource);
    try {
      const response = await fetch({ relativeUrl: listPath });
      const list = await response.json();
      const liveResource = list?.items?.[0];
      if (liveResource) {
        resource.metadata.name =
          liveResource.metadata?.name ?? resource.metadata.name;
        resource.metadata.namespace =
          liveResource.metadata?.namespace ?? resource.metadata.namespace;
      }
    } catch {
      // best-effort enrichment — continue with template metadata
    }

    const partialPath = createModulePartialPath(
      hasExtension,
      resource,
      moduleCrd,
      isNamespaced,
    );

    const path = namespaced
      ? namespaceUrl(partialPath)
      : clusterUrl(partialPath);

    setLayoutColumn((prev) => ({
      startColumn: prev.startColumn,
      midColumn: {
        resourceType: hasExtension
          ? pluralize(kind).toLowerCase()
          : moduleCrd?.metadata?.name,
        rawResourceTypeName: kind,
        resourceName: resource.metadata.name,
        namespaceId: isNamespaced
          ? resource.metadata.namespace || DEFAULT_K8S_NAMESPACE
          : '',
        apiGroup: group,
        apiVersion: version,
      } as ColumnState,
      layout: 'TwoColumnsMidExpanded',
      endColumn: null,
    }));

    navigate(`${path}?layout=TwoColumnsMidExpanded`);
  };

  return { handleClickResource, hasDetailsLink, customColumnLayout };
}
