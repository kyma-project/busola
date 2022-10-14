import { destinationRules } from './index.mjs';
import jsyaml from 'js-yaml';
import * as fs from 'fs';

function stringifyObjValue (configMapData) {
  const result = {}
  Object.entries(configMapData).forEach(([key, value]) => {
    result[key] = jsyaml.dump(value, { noRefs: true });
  });
  return result
}

const stringifiedConfigMapData = stringifyObjValue(destinationRules);

const configMap = {
  kind: 'ConfigMap',
  apiVersion: 'v1',
  metadata: {
    name: 'destination-rules',
    namespace: 'kube-public',
    labels: {
      'app.kubernetes.io/name': 'destination-rules',
      'busola.io/extension': 'resource',
      'busola.io/extension-version': '0.5',
    },
  },
  data: stringifiedConfigMapData,
};
const configMapYaml = jsyaml.dump(configMap, { noRefs: true });

fs.writeFile('destination-rules.yaml', configMapYaml, err => {
  if (err) {
    console.error('Failed to generate the config map', err);
  } else {
    console.log(
      'A file',
      '\x1b[32m',
      'destination-rules.yaml',
      '\x1b[0m',
      'has been created.',
      '\x1b[1m',
      "Don't forget to move it to the examples folder.",
      '\x1b[0m',
    );
  }
});
