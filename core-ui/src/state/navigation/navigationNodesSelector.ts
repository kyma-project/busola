import { selector } from 'recoil';
import { completeResourceListSelector } from '../resourceList/completeResourceListSelector';

export const navigationNodesSelector = selector({
  key: 'navigationNodesSelector',

  get: ({ get }) => {
    const resourceList = get(completeResourceListSelector);

    console.log(resourceList);

    return resourceList;
  },
});
