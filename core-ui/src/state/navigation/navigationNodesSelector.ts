import { selector } from 'recoil';
import { completeResourceListSelector } from '../resourceList/completeResourceListSelector';
import { fetchPermissions } from './fetchPermissions';

export const navigationNodesSelector = selector({
  key: 'navigationNodesSelector',

  get: async ({ get }) => {
    const resourceList = get(completeResourceListSelector);
    if (!resourceList) return;

    const permissionSets = await fetchPermissions(get);

    console.log(permissionSets);

    return resourceList;
  },
});
