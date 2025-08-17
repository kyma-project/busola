import { atom } from 'jotai';
import { apiGroupState } from './apiGroupsSelector';

type GroupVersionSelector = string[] | null;

export const groupVersionState = atom<Promise<GroupVersionSelector>>(
  async get => {
    const apiGroups = await get(apiGroupState);

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
);
groupVersionState.debugLabel = 'groupversionstate';
