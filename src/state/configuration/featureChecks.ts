import { AuthDataState } from '../authDataAtom';
import { ConfigFeature } from '../types';
import { ApiGroupState } from 'state/discoverability/apiGroupsSelector';
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
  if (!fetchFn) return;

  const checkSingleUrl = async (url: string) => {
    try {
      const response = await fetchFn({
        relativeUrl: urlMutator(url),
      });
      await validator(response);
      return { succeeded: true, serviceUrl: url };
    } catch (e) {
      console.error('service-check', url, e);
    }
    return { succeeded: false };
  };

  return async (featureName: string, featureConfig: ConfigFeature) => {
    const urls = urlsGenerator(featureConfig);
    for (const url of urls) {
      const { succeeded, serviceUrl } = await checkSingleUrl(url);
      if (succeeded) {
        return { ...featureConfig, serviceUrl, isEnabled: true };
      }
    }
    return { ...featureConfig, isEnabled: false };
  };
}
