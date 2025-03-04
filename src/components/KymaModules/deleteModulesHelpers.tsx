import pluralize from 'pluralize';
import { findModuleStatus } from './support';

interface Counts {
  [key: string]: number;
}

type Resource = {
  kind: string;
  group: string;
  version: string;
};

export const getAssociatedResources = (
  chosenModuleIndex: number,
  findModuleTemplate: Function,
  selectedModules: any,
  kymaResource: any,
) => {
  if (!chosenModuleIndex) {
    return [];
  }
  const selectedModule = selectedModules[chosenModuleIndex];
  const moduleChannel = selectedModule?.channel || kymaResource?.spec?.channel;
  const moduleVersion =
    selectedModule?.version ||
    findModuleStatus(kymaResource, selectedModule?.name)?.version;

  const module = findModuleTemplate(
    selectedModule?.name,
    moduleChannel,
    moduleVersion,
  );
  return module?.spec?.associatedResources || [];
};

export const getCRResource = (
  chosenModuleIndex: number,
  findModuleTemplate: Function,
  selectedModules: any,
  kymaResource: any,
) => {
  if (!chosenModuleIndex) {
    return [];
  }
  const selectedModule = selectedModules[chosenModuleIndex];
  const moduleChannel = selectedModule?.channel || kymaResource?.spec?.channel;
  const moduleVersion =
    selectedModule?.version ||
    findModuleStatus(kymaResource, selectedModule?.name)?.version;

  const module = findModuleTemplate(
    selectedModule?.name,
    moduleChannel,
    moduleVersion,
  );

  let resource: Resource | null = null;
  if (module.spec.data) {
    resource = {
      group: module.spec.data.apiVersion.split('/')[0],
      version: module.spec.data.apiVersion.split('/')[1],
      kind: module.spec.data.kind,
    };
  }
  return resource ? [resource] : [];
};

export const handleItemClick = async (
  kind: string,
  group: string,
  version: string,
  clusterUrl: Function,
  getScope: Function,
  namespaceUrl: Function,
  navigate: Function,
) => {
  const isNamespaced = await getScope(group, version, kind);
  const path = `${pluralize(kind.toLowerCase())}`;
  const link = isNamespaced
    ? namespaceUrl(path, { namespace: '-all-' })
    : clusterUrl(path);

  navigate(link);
};

const getResources = async (
  kind: string,
  group: string,
  version: string,
  fetchFn: Function,
) => {
  const url =
    group === 'v1'
      ? '/api/v1'
      : `/apis/${group}/${version}/${pluralize(kind.toLowerCase())}`;

  try {
    const response = await fetchFn(url);
    console.log(response);
    const json = await response.json();

    return json.items;
  } catch (e) {
    console.warn(e);
    return 'Error';
  }
};

const getUrlsByNamespace = (resources: Resource[]) => {
  return resources.reduce((urls: Array<string>, resource: any) => {
    const url = `/apis/${resource.apiVersion}/namespaces/${
      resource.metadata.namespace
    }/${pluralize(resource.kind.toLowerCase())}`;

    if (!urls.includes(url)) {
      urls.push(url);
    }
    return urls;
  }, []);
};

export const generateAssociatedResourcesUrls = async (
  resources: Resource[],
  fetchFn: Function,
  clusterUrl: Function,
  getScope: Function,
  namespaceUrl: Function,
  navigate: Function,
) => {
  const allUrls = [];

  for (const resource of resources) {
    const isNamespaced = await getScope(
      resource.group,
      resource.version,
      resource.kind,
      clusterUrl,
      getScope,
      namespaceUrl,
      navigate,
    );
    let resources,
      urls = [];
    if (isNamespaced) {
      resources = await getResources(
        resource.kind,
        resource.group,
        resource.version,
        fetchFn,
      );
      urls = getUrlsByNamespace(resources);
    } else {
      urls = [
        resource.group === 'v1'
          ? '/api/v1'
          : `/apis/${resource.group}/${resource.version}/${pluralize(
              resource.kind.toLowerCase(),
            )}`,
      ];
    }

    allUrls.push(...urls);
  }

  return allUrls;
};

export const fetchResourceCounts = async (
  resources: Resource[],
  fetchFn: Function,
) => {
  const counts: Counts = {};
  for (const resource of resources) {
    const count = await getResources(
      resource.kind,
      resource.group,
      resource.version,
      fetchFn,
    );

    const keyName = `${resource.kind}-${resource.group}-${resource.version}`;
    counts[keyName] = count.length;
  }
  return counts;
};

export const checkIfAssociatedResourceLeft = (
  resourceCounts: Counts,
  chosenModuleIndex: number,
  findModuleTemplate: Function,
  selectedModules: any,
  kymaResource: any,
) => {
  const resources: Resource[] = getAssociatedResources(
    chosenModuleIndex,
    findModuleTemplate,
    selectedModules,
    kymaResource,
  );

  for (const resource of resources) {
    if (
      resourceCounts[`${resource.kind}-${resource.group}-${resource.version}`] >
      0
    ) {
      return true;
    }
  }
  return false;
};

export const deleteAssociatedResources = async (
  deleteResourceMutation: Function,
  forceDeleteUrls: string[],
) => {
  try {
    await Promise.all(
      forceDeleteUrls.map(async url => {
        return await deleteResourceMutation(url);
      }),
    );
  } catch (e) {
    console.warn(e);
    return 'Error while deleting Associated Resources';
  }
};

export const deleteCrResources = async (
  deleteResourceMutation: Function,
  crUrls: string[],
) => {
  try {
    await Promise.all(
      crUrls.map(async url => {
        return await deleteResourceMutation(url);
      }),
    );
  } catch (e) {
    console.warn(e);
    return 'Error while deleting Custom Resource';
  }
};
