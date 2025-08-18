import { addHistoryEntry } from './search-history';

export const activateResult = (query: string, activateCallback: () => void) => {
  addHistoryEntry(query);
  activateCallback();
};

export const isResultGoingToRedirect = (resultQuery: string) => {
  switch (resultQuery) {
    case 'preferences':
    case 'prefs':
    case 'upload':
    case 'up':
      return false;
    default:
      return true;
  }
};
