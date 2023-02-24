import jsyaml from 'js-yaml';

export default async function multiFile(source) {
  const parsed = jsyaml.load(source);
  return JSON.stringify(parsed);
}
