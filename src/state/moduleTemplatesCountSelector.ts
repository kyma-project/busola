import { RecoilValueReadOnly, selector } from 'recoil';
import { getFetchFn } from './utils/getFetchFn';
import { clusterState } from './clusterAtom';

type ModuleTemplatesCount = number;

export const moduleTemplatesCountSelector: RecoilValueReadOnly<ModuleTemplatesCount> = selector<
  ModuleTemplatesCount
>({
  key: 'moduleTemplatesCount',
  get: async ({ get }) => {
    // We need to track if cluster changes
    const _cluster = get(clusterState); // eslint-disable-line @typescript-eslint/no-unused-vars
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
  },
});
