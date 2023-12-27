import { atom, RecoilState } from 'recoil';

type ColumnState = {
  resourceName: null | string;
  resourceType: null | string;
  url: null | string;
  namespaceId: null | string;
};

type ColumnLayoutState = {
  midColumn: null | ColumnState;
  endColumn: null | ColumnState;
  layout: string;
};

//empty value here would mean '[*]' - all namespaces

const defaultValue = {
  layout: 'OneColumn',
  midColumn: null,
  endColumn: null,
};

export const columnLayoutState: RecoilState<ColumnLayoutState> = atom<
  ColumnLayoutState
>({
  key: 'ColumnLayoutState',
  default: defaultValue,
});
