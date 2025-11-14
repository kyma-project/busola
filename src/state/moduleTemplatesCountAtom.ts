import { atom } from 'jotai';
import { getFetchFn } from './utils/getFetchFn';
import { clusterAtom } from './clusterAtom';

export const moduleTemplatesCountAtom = atom<Promise<number>>(async (get) => {
  // Track cluster changes by getting the cluster atom
  // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
  const _cluster = get(clusterAtom);
  const fetchFn = getFetchFn(get);

  if (!fetchFn) return null;

  let moduleTemplates;
  try {
    const response = await fetchFn({
      relativeUrl: '/apis/operator.kyma-project.io/v1beta2/moduletemplates',
    });
    moduleTemplates = await response.json();
  } catch (e) {
    return null;
  }
  return moduleTemplates?.items.length || 0;
});
moduleTemplatesCountAtom.debugLabel = 'moduleTemplatesCountAtom';
