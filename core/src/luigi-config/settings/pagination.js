import { configChanged } from './../utils/configChanged';

const PAGE_SIZE_STORAGE_KEY = 'busola.page-size';
const DEFAULT_PAGE_SIZE = 20;

export const AVAILABLE_PAGE_SIZES = [10, 20, 50];

export function getPageSize() {
  const pageSize = parseInt(localStorage.getItem(PAGE_SIZE_STORAGE_KEY));
  return AVAILABLE_PAGE_SIZES.includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE;
}

export function setPageSize(pageSize) {
  localStorage.setItem(PAGE_SIZE_STORAGE_KEY, pageSize);
}

export const communicationEntry = {
  'busola.set-page-size': ({ pageSize }) => {
    setPageSize(pageSize);

    configChanged({
      value: pageSize,
      valuePath: '$.context.settings.pagination.pageSize',
      scope: 'navigation',
    });
  },
};
