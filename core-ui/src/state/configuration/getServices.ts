import { ConfigFeature } from 'state/types';

export function service({
  urlsGenerator,
  validator = async res => res?.status < 400,
  urlMutator = url => url,
}: {
  urlsGenerator: (featureConfig: ConfigFeature) => string[];
  validator: (res: Response) => Promise<boolean>;
  urlMutator: (url: string) => string;
}) {
  const subscribeToAllUrls = async (
    urls: string[],
    featureName: string,
    featureConfig: ConfigFeature,
  ) => {
    for (const url of urls) {
      const data = await fetch(urlMutator(url));
      updateFeature(featureName, featureConfig, data);
    }
  };

  const checkSingleUrl = async (
    url: string,
    featureName: string,
    featureConfig: ConfigFeature,
  ) => {
    const res = await fetch(urlMutator(url));
    try {
      const serviceFound = await validator(res);
      if (serviceFound) {
        const data = await fetch(urlMutator(url));
        updateFeature(featureName, featureConfig, data);

        return { succeeded: true, serviceUrl: url };
      }
    } catch (e) {
      console.debug('service-check', url, e);
    }
    return { succeeded: false };
  };

  return async (featureName: string, featureConfig: ConfigFeature) => {
    const urls = urlsGenerator(featureConfig);
    for (const url of urls) {
      const { succeeded, serviceUrl } = await checkSingleUrl(
        url,
        featureName,
        featureConfig,
      );
      if (succeeded) {
        return { ...featureConfig, serviceUrl, isEnabled: true };
      }
    }
    // service is not available, let's ping all the addresses
    await subscribeToAllUrls(urls, featureName, featureConfig);
    return { ...featureConfig, isEnabled: false };
  };
}

export async function updateFeature(
  featureName: string,
  featureConfig: ConfigFeature,
  res: Response,
) {
  // todo
  console.log(featureName, featureConfig, res);
}
