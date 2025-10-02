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

function sleep(lf_ms: number) {
  return new Promise((resolve) => setTimeout(resolve, lf_ms));
}

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
    // setState Downloading
    await sleep(2000);
    callback(moduleTpl, State.Downloading);

    const allResourcesLinks =
      moduleTpl.spec.resources?.map((resource) => resource.link) || [];
    const allResources = await getAllResourcesYamls(
      allResourcesLinks,
      postRequest,
    );

    // setState preparing
    await sleep(2000);
    callback(moduleTpl, State.Preparing);

    // setState uploading
    await sleep(2000);
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

    await sleep(2000);
    callback(moduleTpl, State.Finished);
  } catch (e) {
    if (e instanceof Error) {
      callback(moduleTpl, State.Error, e.message);
      throw e;
    } else {
      console.error(e);
    }
  }
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
    const { resources: filteresResources, otherResources } =
      filterResourcesByKind(kindFilter, resources);
    resourcesToUpload = filteresResources;
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
  // TODO: check all promises and raise exception

  const result = await Promise.allSettled(uploadPromises);
  const failedCRDUploadResults = result.filter((r) => r.status !== 'fulfilled');
  if (failedCRDUploadResults.length !== 0) {
    throw new Error(`Upload failed: ${failedCRDUploadResults[0].reason}`);
  }
  return notUploadedResources;
}

export function filterResourcesByKind(
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
  const existingResource = await singleGet(urlWithName);
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
