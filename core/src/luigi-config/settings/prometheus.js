import * as jp from 'jsonpath';

export const communicationEntry = {
  'busola.setPrometheusPath': ({ path }) => {
    const config = Luigi.getConfig();
    // set context of all first-level nodes
    config.navigation.nodes.forEach(node =>
      jp.value(node, '$.context.features.PROMETHEUS.config.path', path),
    );
    Luigi.configChanged('navigation');
  },
};
