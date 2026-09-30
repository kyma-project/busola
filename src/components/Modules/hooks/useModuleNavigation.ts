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
  fetchLiveResource,
  findCrd,
  findExtension,
  findModuleTemplate,
  getExtensionUrlPath,
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
  namespace?: string;
  state?: string;
  resource?: ModuleResource;
  hasLiveResource?: boolean;
  template?: {
    apiVersion?: string;
    metadata?: { name: string; namespace?: string };
    kind?: string;
  };
};

type UseModuleNavigationOptions = {
  moduleTemplates: ModuleTemplateListType;
  extensions: any;
  crds: any;
  namespaced: boolean;
  installedModules: { name: string }[];
  setOpenedModuleIndex: (index: number) => void;
  setSelectedEntry?: (name: string) => void;
  // When true, a row is only clickable if its module state is positive
  // (used to block managed modules during intermediate/installing states).
  // Community module entries carry no state field, so they opt out.
  checkModuleState?: boolean;
};

const checkIfStateIsPositive = (state?: string) => {
  const positiveStates = [
    'Available',
    'Ready',
    'Bound',
    'Running',
    'Success',
    'Succeeded',
    'Progressing',
    'Ok',
    'Finished',
  ];
  return positiveStates.includes(state ?? '');
};

export function useModuleNavigation({
  moduleTemplates,
  extensions,
  crds,
  namespaced,
  installedModules,
  setOpenedModuleIndex,
  setSelectedEntry,
  checkModuleState = true,
}: UseModuleNavigationOptions) {
  const navigate = useNavigate();
  const { clusterUrl, namespaceUrl } = useUrl();
  const setLayoutColumn = useSetAtom(columnLayoutAtom);
  const getScope = useGetScope();
  const fetch = useFetch();

  const hasDetailsLink = (resource: ModuleEntry) => {
    const kind =
      resource?.resource?.kind ??
      findModuleTemplate(
        moduleTemplates,
        resource?.name,
        resource?.channel ?? '',
        resource?.version ?? '',
        resource?.template,
        resource?.namespace,
      )?.spec?.data?.kind ??
      '';

    const hasRenderer =
      !!findExtension(kind, extensions) || !!findCrd(kind, crds);
    if (!hasRenderer) return false;

    // Managed modules gate on reported state; community modules on a live CR instance.
    return checkModuleState
      ? checkIfStateIsPositive(resource.state)
      : resource.hasLiveResource === true;
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

  // Resolve which CR the row should open: the module's own resource when
  // present, otherwise the connected template's CR. Null means "nothing to open".
  const resolveTargetResource = (
    moduleName: string,
    moduleStatus: ModuleEntry,
  ): ModuleResource | null => {
    if (moduleStatus.resource) {
      return {
        kind: moduleStatus.resource.kind,
        apiVersion: moduleStatus.resource.apiVersion,
        metadata: { ...moduleStatus.resource.metadata },
      };
    }

    const moduleCr = findModuleTemplate(
      moduleTemplates,
      moduleName,
      moduleStatus.channel ?? '',
      moduleStatus.version ?? '',
      moduleStatus.template,
      moduleStatus?.namespace,
    )?.spec?.data;
    if (!moduleCr) return null;

    return {
      kind: moduleCr.kind,
      apiVersion: moduleCr.apiVersion,
      metadata: {
        name: moduleCr.metadata?.name ?? '',
        namespace: moduleCr.metadata?.namespace ?? '',
      },
    };
  };

  const handleClickResource = async (
    moduleName: string,
    moduleStatus: ModuleEntry,
  ) => {
    if (!moduleStatus) return;

    // Cheap early-out: a community row known to lack a live CR never navigates.
    if (!checkModuleState && moduleStatus.hasLiveResource === false) return;

    const resource = resolveTargetResource(moduleName, moduleStatus);
    if (!resource) return;

    const kind = resource.kind;
    const matchedExtension = findExtension(kind, extensions);
    const hasExtension = !!matchedExtension;
    const moduleCrd = findCrd(kind, crds);
    if (!hasExtension && !moduleCrd) return;

    // Nav must emit the renderer's urlPath so the CR pane opens.
    const extensionUrlPath = hasExtension
      ? getExtensionUrlPath(matchedExtension, kind)
      : undefined;

    const { group, version } = extractApiGroupVersion(resource.apiVersion);

    let isNamespaced: boolean;
    try {
      isNamespaced = await getScope(group, version, kind);
    } catch {
      return;
    }

    if (isNamespaced && !resource.metadata.namespace) {
      resource.metadata.namespace = DEFAULT_K8S_NAMESPACE;
    }

    const liveResource = await fetchLiveResource(fetch, resource);

    // Authoritative gate: don't open an empty detail pane when a community
    // module has no CR instance. Managed modules keep best-effort behaviour.
    if (!checkModuleState && !liveResource) return;

    if (liveResource) {
      resource.metadata.name =
        liveResource.metadata?.name ?? resource.metadata.name;
      resource.metadata.namespace =
        liveResource.metadata?.namespace ?? resource.metadata.namespace;
    }

    setOpenedModuleIndex(
      installedModules.findIndex((entry) => entry.name === moduleName),
    );
    setSelectedEntry?.(moduleName);

    const partialPath = createModulePartialPath(
      hasExtension,
      resource,
      moduleCrd,
      isNamespaced,
      extensionUrlPath,
    );

    const path = namespaced
      ? namespaceUrl(partialPath)
      : clusterUrl(partialPath);

    setLayoutColumn((prev) => ({
      startColumn: prev.startColumn,
      midColumn: {
        resourceType: hasExtension
          ? extensionUrlPath
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
