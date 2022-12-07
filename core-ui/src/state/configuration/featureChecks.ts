import { AuthDataState, authDataState } from '../authDataAtom';
import { ConfigFeature, ConfigFeatureList } from '../types';
import {
  ApiGroupState,
  apiGroupState,
} from 'state/discoverability/apiGroupsSelector';
import { FetchFn } from 'shared/hooks/BackendAPI/useFetch';

function extractGroupVersions(apis: ApiGroupState) {
  const CORE_GROUP = 'v1';
  if (!apis) return [CORE_GROUP];
  return [
    CORE_GROUP,
    ...apis.flatMap(api => api?.versions?.map(version => version.groupVersion)),
  ];
}

export function apiGroup({
  group,
  auth,
  apis,
}: {
  group: string;
  auth: AuthDataState;
  apis: ApiGroupState;
}) {
  const containsGroup = (groupVersions: any[]) =>
    groupVersions?.find(g => g.includes(group));

  return async ({
    featureName,
    featureConfig,
  }: {
    featureName: string;
    featureConfig: ConfigFeature;
  }) => {
    if (!auth) {
      return { ...featureConfig, isEnabled: false };
    }
    try {
      const groupVersions = extractGroupVersions(apis);

      return {
        ...featureConfig,
        isEnabled: !!containsGroup(groupVersions),
      };
    } catch (e) {
      return featureConfig;
    }
  };
}

export function service({
  fetchFn,
  urlsGenerator,
  validator = async res => res?.status < 400,
  urlMutator = url => url,
}: {
  fetchFn: FetchFn | undefined;
  urlsGenerator: (featureConfig: ConfigFeature) => string[];
  validator?: (res: Response) => Promise<boolean>;
  urlMutator?: (url: string) => string;
}) {
  console.log(1);
  if (!fetchFn) return;
  console.log(2);
  const subscribeToAllUrls = async (
    urls: string[],
    featureName: string,
    featureConfig: ConfigFeature,
  ) => {
    for (const url of urls) {
      const response = await fetchFn({
        relativeUrl: urlMutator(url),
      });
      const data = await response.json();
      console.log('url in urls', data);
    }
  };

  const checkSingleUrl = async (
    url: string,
    featureName: string,
    featureConfig: ConfigFeature,
  ) => {
    const response = await fetchFn({
      relativeUrl: urlMutator(url),
    });
    try {
      const serviceFound = await validator(response);
      console.log('serviceFound', serviceFound);
      return { succeeded: true, serviceUrl: url };
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
