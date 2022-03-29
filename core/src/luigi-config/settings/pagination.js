import * as jp from 'jsonpath';

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

    const config = Luigi.getConfig();
    // set context of all first-level nodes
    config.navigation.nodes.forEach(node =>
      jp.value(node, '$.context.settings.pagination.pageSize', pageSize),
    );
    Luigi.configChanged('navigation');
  },
};
