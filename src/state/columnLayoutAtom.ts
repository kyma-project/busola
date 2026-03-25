import { atom } from 'jotai';
import type FCLLayout from '@ui5/webcomponents-fiori/dist/types/FCLLayout';

export type ColumnState = {
  resourceName: null | string;
  resourceType: null | string;
  rawResourceTypeName?: null | string;
  namespaceId?: null | string;
  apiGroup?: null | string;
  apiVersion?: null | string;
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
  layout: FCLLayout | keyof typeof FCLLayout;
};

const defaultValue: ColumnLayoutState = {
  layout: 'OneColumn',
  startColumn: null,
  midColumn: null,
  endColumn: null,
  showCreate: null,
  showEdit: null,
};

export const columnLayoutAtom = atom<ColumnLayoutState>(defaultValue);
columnLayoutAtom.debugLabel = 'columnLayoutAtom';
