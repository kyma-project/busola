import { atom, RecoilState } from 'recoil';

export type ColumnState = {
  resourceName: null | string;
  resourceType: null | string;
  rawResourceTypeName?: null | string;
  namespaceId: null | string;
  apiGroup: null | string;
  apiVersion: null | string;
};
export type ShowCreate = {
  resourceType: null | string;
  rawResourceTypeName?: null | string;
  createType?: null | string;
  namespaceId: null | string;
  resource?: null | object;
  resourceUrl?: null | string;
};
export type ShowEdit = ColumnState & {
  resource?: object | null;
};

export type ColumnLayoutState = {
  startColumn: null | ColumnState;
  midColumn: null | ColumnState;
  endColumn: null | ColumnState;
  showCreate?: null | ShowCreate;
  showEdit?: null | ShowEdit;
  layout: string;
};

//empty value here would mean '[*]' - all namespaces

const defaultValue = {
  layout: 'OneColumn',
  startColumn: null,
  midColumn: null,
  endColumn: null,
  showCreate: null,
  showEdit: null,
};

export const columnLayoutState: RecoilState<ColumnLayoutState> = atom<
  ColumnLayoutState
>({
  key: 'ColumnLayoutState',
  default: defaultValue,
});
