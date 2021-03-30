import jsyaml from 'js-yaml';

function readFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsText(file);
  });
}

export function readKubeconfigFile(file) {
  return readFile(file).then(jsyaml.safeLoad);
}
