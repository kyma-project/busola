import { LOCAL_STORAGE_NAMESPACE_FILTERS } from './../../shared/constants';

export function readStoredFilterLabels() {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_NAMESPACE_FILTERS);
    return JSON.parse(item) || [];
  } catch (error) {
    return [];
  }
}

export function saveStoredFilterLabels(filters) {
  window.localStorage.setItem(
    LOCAL_STORAGE_NAMESPACE_FILTERS,
    JSON.stringify(filters),
  );
}
