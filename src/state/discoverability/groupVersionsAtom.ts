import { atom } from 'jotai';
import { apiGroupAtom } from './apiGroupsAtom';

type GroupVersionSelector = string[] | null;

export const groupVersionsAtom = atom<Promise<GroupVersionSelector>>(
  async get => {
    const apiGroups = await get(apiGroupAtom);

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
groupVersionsAtom.debugLabel = 'groupVersionsAtom';
