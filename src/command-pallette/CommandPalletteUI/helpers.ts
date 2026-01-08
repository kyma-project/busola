import { addHistoryEntry } from './search-history';

export const activateResult = (query: string, activateCallback: () => void) => {
  addHistoryEntry(query);
  activateCallback();
};

export const isResultGoingToRedirect = (resultQuery: string) => {
  switch (resultQuery) {
    case 'settings':
    case 'set':
    case 'upload':
    case 'up':
      return false;
    default:
      return true;
  }
};
