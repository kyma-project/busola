import { apiGroupState } from './apiGroupsSelector';

import { selector, RecoilValue } from 'recoil';

type GroupVersionSelector = string[] | null;

export const groupVersionState: RecoilValue<GroupVersionSelector> = selector<
  GroupVersionSelector
>({
  key: 'groupversionstate',
  get: ({ get }) => {
    const apiGroups = get(apiGroupState);
    if (!apiGroups) return null;
    else {
      const CORE_GROUP = 'v1';
      return [
        CORE_GROUP,
        ...apiGroups.flatMap(group =>
          group.versions.map(version => version.groupVersion),
        ),
      ];
    }
  },
});
