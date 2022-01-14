import { loadFile } from './loadFile';

export async function loadPVC(name, namespace, fileName) {
  const resource = await loadFile(fileName);
  const newResource = { ...resource };

  newResource.metadata.name = name;
  newResource.metadata.namespace = namespace;

  return newResource;
}
