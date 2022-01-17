const HISTORY_KEY = 'busola.command-palette-history';

export function getHistoryEntries() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') || [];
}

export function addHistoryEntry(query) {
  const entries = getHistoryEntries();
  // don't duplicate consecutive entries
  if (query === entries[0]) {
    return;
  }
  if (entries.length >= 10) {
    entries.length = 9;
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify([query, ...entries]));
}
