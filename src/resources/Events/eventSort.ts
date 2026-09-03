import { SortByObject } from 'shared/components/GenericList/GenericList';

type EventResource = Record<string, any>;

// Ascending comparators so the sort modal's ASC/DESC toggle matches its labels.
export const eventSortComparators = {
  type: (a: EventResource, b: EventResource) => a.type.localeCompare(b.type),
  lastseen: (a: EventResource, b: EventResource) =>
    new Date(a.lastTimestamp).getTime() - new Date(b.lastTimestamp).getTime(),
  count: (a: EventResource, b: EventResource) =>
    (a.count || 0) - (b.count || 0),
};

export const eventInitialSort = { name: 'lastseen', order: 'DESC' } as const;

export const eventSortByFn = (defaultSort: any): SortByObject => {
  const { name } = defaultSort;
  return {
    name,
    ...eventSortComparators,
  };
};
