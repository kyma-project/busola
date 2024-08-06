export function getDescription(schema: any, path: string): string {
  let contextSchema = schema;
  console.log('get desc', path, path.split('.'), schema);

  path.split('.').forEach(pathItem => {
    let el = null;
    if (pathItem.endsWith('[]')) {
      pathItem = pathItem.replace('[]', '');
      el = contextSchema?.items?.properties?.[pathItem];
    } else {
      el = contextSchema?.properties?.[pathItem];
    }
    if (el) {
      contextSchema = el;
    }
  });

  return contextSchema?.description
    ? contextSchema?.description
    : 'Description not found';
}

export function getPartialSchema(schema: any, path: string): string {
  let contextSchema = schema;

  path.split('.').forEach(pathItem => {
    let el = null;
    if (pathItem.endsWith('[]')) {
      pathItem = pathItem.replace('[]', '');
      el = contextSchema?.properties?.[pathItem]?.items;
    } else {
      el = contextSchema?.properties?.[pathItem];
    }
    if (el) {
      contextSchema = el;
    }
  });

  return contextSchema;
}
