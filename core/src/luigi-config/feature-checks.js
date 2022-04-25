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

// could be "function resource(..." as well?
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
        // todo subscribe to url updates & re-run resolving function (the one with reduce)
        if (await validator(res)) {
          return {
            ...config,
            serviceUrl: url,
          };
        }
      } catch (e) {
        console.log('Service feature check: ', url, 'failed, trying next.');
      }
    }
    return {
      ...config,
      isEnabled: false,
    };
  };
}
