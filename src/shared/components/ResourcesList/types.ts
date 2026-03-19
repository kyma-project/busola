import { ReactNode, RefObject } from 'react';
import {
  Actions,
  EmptyListProps,
  SortByObject,
} from '../GenericList/GenericList';
import {
  PaginationType,
  SearchSettingsType,
} from '../GenericList/components/TableBody';
import { LayoutColumnName } from 'types';

export type CustomColumn = {
  header?: string;
  value: (resource: any) => ReactNode | string;
  id?: string;
  visibility?: (resource: any) => boolean;
};

export type ResourcesListProps = {
  customColumns?: CustomColumn[];
  createResourceForm?: Record<string, any>;
  customHeaderActions?: ReactNode;
  createActionLabel?: string;
  resourceUrl: string;
  resourceType: string;
  rawResourceType?: string;
  resourceTitle?: string;
  namespace?: string;
  hasDetailsView?: boolean;
  isCompact?: boolean;
  showTitle?: boolean;
  filter?: (resource: any) => boolean | Promise<boolean>;
  listHeaderActions?: ReactNode;
  description?: ReactNode;
  readOnly?: boolean;
  customUrl?: (resource: any) => string;
  testid?: string;
  omitColumnsIds?: string[];
  resourceUrlPrefix?: string;
  disableCreate?: boolean;
  disableDelete?: boolean;
  enableColumnLayout?: boolean;
  layoutNumber?: LayoutColumnName;
  filterFn?: (resource: any) => boolean;
  createFormRef?: RefObject<any> | null;
  resources?: Record<string, any>[];
  columns?: CustomColumn[];
  title?: string;
  customListActions?: Actions;
  pagination?: PaginationType;
  emptyListProps?: EmptyListProps;
  nameSelector?: (entry?: Record<string, any>) => string;
  columnLayout?: string;
  customColumnLayout?: (entry: any) => any;
  layoutCloseCreateUrl?: string;
  sortBy?: SortByObject | ((a: any) => SortByObject);
  searchSettings?: Omit<SearchSettingsType, 'textSearchProperties'> & {
    textSearchProperties?: any[] | ((entry: any) => any[]);
  };
  parentCrdName?: string;
  simpleEmptyListMessage?: boolean;
  disableHiding?: boolean;
  displayArrow?: boolean;
  accessibleName?: string;
};

export type ResourceListRendererProps = Omit<ResourcesListProps, 'filter'> & {
  loading?: boolean;
  error?: any;
  silentRefetch?: () => void;
  resources: Record<string, any>[];
};

export type ResourceProps = Omit<
  ResourceListRendererProps,
  'loading' | 'error' | 'silentRefetch' | 'resources'
> & {
  filter?: (resource: any) => boolean | Promise<boolean>;
  skipDataLoading?: boolean;
};
