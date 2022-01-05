export function getHistoryEntries() {
  return (
    JSON.parse(localStorage.getItem('busola.compass-history') || '[]') || []
  );
}

export function addHistoryEntry(query) {
  const entries = getHistoryEntries();
  if (entries.length >= 10) {
    entries.length = 9;
  }
  localStorage.setItem(
    'busola.compass-history',
    JSON.stringify([query, ...entries]),
  );
}
