export function getDescription(schema: any, path: string): string {
  let contextSchema = schema;

  path.split('.').forEach(pathItem => {
    const el = contextSchema?.properties?.[pathItem];
    if (el) {
      contextSchema = el;
    }
  });

  return contextSchema?.description
    ? contextSchema?.description
    : 'Description not found';
}
