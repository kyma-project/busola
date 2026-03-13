import { ReactNode, RefObject } from 'react';
import {
  Actions,
  EmptyListProps,
  SortByObject,
} from '../GenericList/GenericList';
import { SearchSettingsType } from '../GenericList/components/TableBody';

type CustomColumn = {
  header?: string;
  value: (resource: any) => ReactNode;
  id: string;
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
  filter?: (resource: any) => boolean;
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
  layoutNumber?: string;
  filterFn?: (resource: any) => boolean;
  createFormRef?: RefObject<any> | null;
  resources?: Record<string, any>[];
  columns?: CustomColumn[];
  title?: string;
  customListActions?: Actions[];
  pagination?: {
    pageSize: number;
    serverSide?: boolean;
  };
  emptyListProps?: EmptyListProps;
  nameSelector?: (entry?: Record<string, any>) => string;
  columnLayout?: string;
  customColumnLayout?: (entry: any) => any;
  layoutCloseCreateUrl?: string;
  sortBy?: SortByObject | ((a: any) => SortByObject);
  searchSettings?: SearchSettingsType;
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
