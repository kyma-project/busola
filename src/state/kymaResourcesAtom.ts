import { atom } from 'jotai';
import { getFetchFn } from './utils/getFetchFn';

export const kymaResourcesAtom = atom(async (get) => {
  // We need to track if cluster changes
  const fetchFn = getFetchFn(get);

  if (!fetchFn) return null;

  try {
    const response = await fetchFn({
      relativeUrl:
        '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas',
    });
    return await response.json();
  } catch (e) {
    console.error('Error fetching Kyma resources:', e);
    return null;
  }
});
kymaResourcesAtom.debugLabel = 'kymaResourcesAtom';
