import { apiGroup, service } from './featureChecks';
import { AuthDataState } from '../authDataAtom';
import { ConfigFeature } from '../types';
import { ApiGroupState } from '../discoverability/apiGroupsSelector';
import { FetchFn } from 'shared/hooks/BackendAPI/useFetch';

const arrayCombine = (arrays: string[][]): string[][] => {
  const _arrayCombine = (
    arrs: string[][],
    current: string[] = [],
  ): string[][] => {
    if (arrs.length === 1) {
      return arrs[0]?.map((e: string) => [...current, e]);
    } else {
      return arrs[0]?.map((e: string) =>
        _arrayCombine(arrs.slice(1), [...current, e]),
      );
    }
  };

  return _arrayCombine(arrays).flat(arrays.length - 1);
};

export const getPrometheusConfig = (
  auth: AuthDataState,
  apis: ApiGroupState,
  fetchFn: FetchFn | undefined,
): ConfigFeature => {
  const prometheusDefault = {
    checks: [
      apiGroup({ group: 'monitoring.coreos.com', auth, apis }),
      service({
        fetchFn,
        urlsGenerator: featureConfig => {
          return arrayCombine([
            featureConfig.namespaces,
            featureConfig.serviceNames,
            featureConfig.portNames,
          ]).map(
            ([namespace, serviceName, portName]) =>
              `/api/v1/namespaces/${namespace}/services/${serviceName}:${portName}/proxy/api/v1`,
          );
        },
        urlMutator: url => `${url}/status/runtimeinfo`,
      }),
    ],
    namespaces: ['kyma-system'],
    serviceNames: ['monitoring-prometheus', 'prometheus'],
    portNames: ['http-web'],
  };

  return prometheusDefault;
};
