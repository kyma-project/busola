import { atom, RecoilState } from 'recoil';

type GroupsState = string[];

const defaultValue: GroupsState = [];

export const groupsState: RecoilState<GroupsState> = atom<GroupsState>({
  key: 'groupsState',
  default: defaultValue,
});
