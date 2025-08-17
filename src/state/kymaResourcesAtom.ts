import { getFetchFn } from './utils/getFetchFn';
import { clusterState } from './clusterAtom';
import { atom } from 'jotai';

export const kymaResourcesAtom = atom(async get => {
  // We need to track if cluster changes
  const _cluster = get(clusterState); // eslint-disable-line @typescript-eslint/no-unused-vars
  const fetchFn = getFetchFn(get);

  if (!fetchFn) return null;

  try {
    const response = await fetchFn({
      relativeUrl:
        '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas',
    });
    return await response.json();
  } catch (e) {
    return null;
  }
});
kymaResourcesAtom.debugLabel = 'kymaResourcesAtom';
