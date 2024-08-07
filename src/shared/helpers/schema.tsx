/**
 * This method get description of k8s resource field. Similar in functionality to kubectl explain.
 *
 * @param schema json schema of k8s resource
 * @param path path to desired field. kubectl explain format is accepted
 */
export function getDescription(schema: any, path: string): string {
  let contextSchema = schema;
  path.split('.').forEach(pathItem => {
    //Check if it's array as it has fields under `items`
    contextSchema = contextSchema?.items ? contextSchema.items : contextSchema;
    contextSchema = contextSchema?.properties?.[pathItem];
  });

  const objDesc = contextSchema?.description ? contextSchema.description : '';
  const arrayDesc = contextSchema?.items?.description
    ? contextSchema.items.description
    : '';
  if (!arrayDesc && !objDesc) {
    return 'Description not found';
  }
  return objDesc + (arrayDesc ? ' ' + arrayDesc : '');
}

export function getPartialSchema(schema: any, path: string): string {
  let contextSchema = schema;

  path.split('.').forEach(pathItem => {
    contextSchema = contextSchema?.properties?.[pathItem];
  });

  return contextSchema;
}
