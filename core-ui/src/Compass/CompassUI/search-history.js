export function getHistoryEntries() {
  return (
    JSON.parse(localStorage.getItem('busola.compass-history') || '[]') || []
  );
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
  localStorage.setItem(
    'busola.compass-history',
    JSON.stringify([query, ...entries]),
  );
}
