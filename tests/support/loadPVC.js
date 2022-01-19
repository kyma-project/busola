import { loadFile } from './loadFile';

export async function loadPVC(name, namespace, storage, fileName) {
  const resource = await loadFile(fileName);
  const newResource = { ...resource };

  newResource.metadata.name = name;
  newResource.metadata.namespace = namespace;
  newResource.spec.storageClassName = storage;

  return newResource;
}
