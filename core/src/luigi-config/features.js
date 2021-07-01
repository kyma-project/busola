import { failFastFetch } from './navigation/queries';
import { config } from './config';
import jsonpath from 'jsonpath';

const resolvers = {
  apiGroup: (selector, data) =>
    data.crds.some(crd => crd.includes(selector.apiGroup)),
  configMapJsonPath: async (selector, data) => {
    const { namespace, name, entry, jsonPath, expectedValue } = selector;

    const cmUrl = `${config.backendAddress}/api/v1/namespaces/${namespace}/configmaps/${name}`;
    const response = await failFastFetch(cmUrl, data.authData);
    const configMap = await response.json();

    const value = jsonpath.query(
      JSON.parse(configMap.data[entry]),
      jsonPath,
    )[0];
    return value === expectedValue;
  },
};

async function resolveSelector(selector, data) {
  if (!resolvers[selector.type]) {
    throw Error('Unkown selector type ' + selector.type);
  } else {
    return await resolvers[selector.type](selector, data);
  }
}

export async function resolveFeatureAvailability(feature, data) {
  try {
    for (const selector of feature.selectors) {
      if (!(await resolveSelector(selector, data))) {
        return false;
      }
    }
    return true;
  } catch (e) {
    console.warn(e);
    return false;
  }
}

export async function resolveNonLazyFeatures(features, data) {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(features).map(async ([key, value]) => [
        key,
        value.lazy ? undefined : await resolveFeatureAvailability(value, data),
      ]),
    ),
  );
}
