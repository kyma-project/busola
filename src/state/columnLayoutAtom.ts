import { atom, RecoilState } from 'recoil';

type ColumnLayoutState = {
  resourceName: null | string;
  resourceType: null | string;
  url: null | string;
  namespaceId: null | string;
};

//empty value here would mean '[*]' - all namespaces

const defaultValue = {
  resourceName: null,
  resourceType: null,
  url: null,
  namespaceId: null,
};

export const columnLayoutState: RecoilState<ColumnLayoutState> = atom<
  ColumnLayoutState
>({
  key: 'ColumnLayoutState',
  default: defaultValue,
});
