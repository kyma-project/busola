export function findRecentRelease(release) {
  const status = release.metadata.labels.status;
  return status === 'deployed' || status.startsWith('pending-');
}
