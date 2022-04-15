import { failFastFetch } from './navigation/queries';
import { config as coreConfig } from './config';

export function convertStaticFeatures(features = {}) {
  return Object.fromEntries(
    Object.entries(features).map(([key, feature]) => {
      if (feature.selectors) {
        feature.checks = feature.selectors.map(selector =>
          apiGroup(selector.apiGroup),
        );
        feature.initial = true;
      }
      return [key, feature];
    }),
  );
}
const xprod = (a, b) => {
  let idx = 0;
  let ilen = a.length;
  let j;
  let jlen = b.length;
  let result = [];

  while (idx < ilen) {
    j = 0;
    while (j < jlen) {
      result[result.length] = [a[idx], b[j]];
      j += 1;
    }
    idx += 1;
  }
  return result;
};
const xprod3 = (a, b, c) =>
  xprod(a, xprod(b, c)).map(([a, [b, c]]) => [a, b, c]);

export function apiGroup(group) {
  return (config, feature, { groupVersions }) => {
    const found = groupVersions?.find(g => g.includes(group));
    return {
      ...config,
      isEnabled: found,
    };
  };
}

function service(
  urlsGenerator,
  validator = async res => res.ok,
  urlMutator = url => url,
) {
  return async (config, feature, { authData }) => {
    const urls = urlsGenerator(config, feature);
    for (const url of urls) {
      try {
        const res = await failFastFetch(
          urlMutator(`${coreConfig.backendAddress}/${url}`),
          authData,
        );
        if (await validator(res)) {
          return {
            ...config,
            serviceUrl: url,
          };
        }
      } catch (e) {}
    }
    return {
      ...config,
      isEnabled: false,
    };
  };
}

// export const DEFAULT_FEATURES = Object.fromEntries(
// Object.entries(DEFAULT_MODULES).map(([key, value]) => [key, apiGroup(value)])
// );

export const discoverableFeatures = {
  PROMETHEUS: {
    initial: false,
    checks: [
      apiGroup('monitoring.coreos.com'),
      service(
        (config, feature) => {
          return xprod3(
            feature.namespaces,
            feature.serviceNames,
            feature.portNames,
          ).map(
            ([namespace, serviceName, portName]) =>
              `api/v1/namespaces/${namespace}/services/${serviceName}:${portName}/proxy/api/v1`,
          );
        },
        undefined,
        url => `${url}/status/runtimeinfo`,
      ),
    ],
    namespaces: ['kyma-system'],
    serviceNames: ['monitoring-prometheus', 'prometheus'],
    portNames: ['web', 'http-web'],
  },
};

export const discoverFeature = (featureName, data = {}) => {
  const feature = discoverableFeatures[featureName];
  if (!feature) return;

  feature.checks.reduce(
    (config, check) => {
      if (!config.isEnabled) return config;
      return check(config, feature, data);
    },
    { isEnabled: true },
  ); // TODO read configuration
};

export const discoverInitialFeatures = (data = {}) => {
  Object.entries(discoverableFeatures)
    .filter(([key, feature]) => feature.initial)
    .forEach(([key]) => discoverFeature(key, data));
};
