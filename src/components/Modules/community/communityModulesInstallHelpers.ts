import { ModuleTemplateType } from 'components/Modules/support';
import { State } from 'components/Modules/community/components/uploadStateAtom';
import { PostFn } from 'shared/hooks/BackendAPI/usePost';
import { MutationFn } from 'shared/hooks/BackendAPI/useMutation';
import { getUrl } from 'resources/Namespaces/YamlUpload/useUploadResources';
import { createPatch } from 'rfc6902';
import { getAllResourcesYamls } from 'components/Modules/community/communityModulesHelpers';

export type CallbackFn = (
  moduleTpl: ModuleTemplateType,
  moduleState: State,
  message?: string,
) => void;

export async function installCommunityModule(
  moduleTpl: ModuleTemplateType,
  clusterNodes: any,
  namespaceNodes: any,
  postRequest: PostFn,
  patchRequest: MutationFn,
  singleGet: Function,
  callback: CallbackFn,
) {
  try {
    callback(moduleTpl, State.Downloading);

    const allResourcesLinks =
      moduleTpl.spec.resources?.map((resource) => resource.link) || [];
    const allResources = await getAllResourcesYamls(
      allResourcesLinks,
      postRequest,
    );

    callback(moduleTpl, State.Uploading);

    let notUploadedResources = await uploadResources(
      allResources,
      clusterNodes,
      namespaceNodes,
      postRequest,
      patchRequest,
      singleGet,
      'CustomResourceDefinition',
    );

    notUploadedResources = await uploadResources(
      notUploadedResources,
      clusterNodes,
      namespaceNodes,
      postRequest,
      patchRequest,
      singleGet,
      'Namespace',
    );

    await uploadResources(
      notUploadedResources,
      clusterNodes,
      namespaceNodes,
      postRequest,
      patchRequest,
      singleGet,
    );
    callback(moduleTpl, State.Finished);
  } catch (e) {
    callback(
      moduleTpl,
      State.Error,
      e instanceof Error ? e.message : 'Unknown Error',
    );
    throw e;
  }
}

function filterResourcesByKind(
  resourceKind: string,
  yamls: any[],
): { resources: any[]; otherResources: any[] } {
  const resources = yamls.filter((yaml) => {
    return yaml.kind === resourceKind;
  });

  const otherResources = yamls.filter((yaml) => {
    return yaml.kind !== resourceKind;
  });
  return { resources, otherResources };
}

async function uploadResources(
  resources: any[],
  clusterNodes: any,
  namespaceNodes: any,
  postRequest: PostFn,
  patchRequest: MutationFn,
  singleGet: Function,
  kindFilter?: string,
): Promise<any[]> {
  let resourcesToUpload: any[] = resources;
  let notUploadedResources: any[] = [];
  if (kindFilter) {
    const { resources: filteredResources, otherResources } =
      filterResourcesByKind(kindFilter, resources);
    resourcesToUpload = filteredResources;
    notUploadedResources = otherResources;
  }

  const uploadPromises = resourcesToUpload.map((r) => {
    return uploadResource(
      { value: r },
      'default',
      clusterNodes,
      namespaceNodes,
      postRequest,
      patchRequest,
      singleGet,
    );
  });
  const result = await Promise.allSettled(uploadPromises);
  const failedUploads = result.filter((r) => r.status !== 'fulfilled');
  if (failedUploads.length !== 0) {
    throw new Error(`Upload failed: ${failedUploads[0].reason.message}`);
  }
  return notUploadedResources;
}

async function uploadResource(
  resource: any,
  namespaceId: string,
  clusterNodes: any,
  namespaceNodes: any,
  post: PostFn,
  patchRequest: MutationFn,
  singleGet: Function,
) {
  const url = await getUrl(
    resource.value,
    namespaceId,
    clusterNodes,
    namespaceNodes,
    singleGet,
  );

  const urlWithName = `${url}/${resource?.value?.metadata?.name}`;
  const existingResource = await checkIfResourceExist(urlWithName, singleGet);
  try {
    if (!existingResource) {
      await post(url, resource.value);
    } else {
      if (
        existingResource?.metadata?.resourceVersion &&
        !resource?.value?.metadata?.resourceVersion
      ) {
        resource.value.metadata.resourceVersion =
          existingResource.metadata.resourceVersion;
      }
      const diff = createPatch(existingResource, resource.value);
      await patchRequest(urlWithName, diff);
    }
  } catch (e) {
    console.warn(e);
    return false;
  }
}

async function checkIfResourceExist(
  url: string,
  singleGet: Function,
): Promise<any> {
  try {
    const response = await singleGet(url);
    return await response.json();
  } catch (_) {
    return null;
  }
}
