import { atom, RecoilState } from 'recoil';

type ColumnState = {
  resourceName: null | string;
  resourceType: null | string;
  namespaceId: null | string;
};
type ShowCreate = {
  resourceName: null | string;
  namespaceId: null | string;
};

type ColumnLayoutState = {
  midColumn: null | ColumnState;
  endColumn: null | ColumnState;
  showCreate?: null | ShowCreate;
  layout: string;
};

//empty value here would mean '[*]' - all namespaces

const defaultValue = {
  layout: 'OneColumn',
  midColumn: null,
  endColumn: null,
  showCreate: null,
};

export const columnLayoutState: RecoilState<ColumnLayoutState> = atom<
  ColumnLayoutState
>({
  key: 'ColumnLayoutState',
  default: defaultValue,
});
