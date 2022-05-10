import * as jp from 'jsonpath';

export function configChanged({ valuePath, value, scope }) {
  const config = window.Luigi.getConfig();
  // set context of all first-level nodes
  config.navigation.nodes.forEach(node => jp.value(node, valuePath, value));
  window.Luigi.configChanged();
}
