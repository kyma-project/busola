import jsyaml from 'js-yaml';

export function isValidYaml(yaml) {
  if (!yaml) return false;
  try {
    jsyaml.load(yaml);
    return true;
  } catch (e) {
    return false;
  }
}
