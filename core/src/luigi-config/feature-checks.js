import { failFastFetch } from './navigation/queries';
import { config as coreConfig } from './config';

export function apiGroup(group) {
  return (config, feature, { groupVersions }) => {
    const found = groupVersions?.find(g => g.includes(group));
    return {
      ...config,
      isEnabled: !!found,
    };
  };
}

export function service(
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
