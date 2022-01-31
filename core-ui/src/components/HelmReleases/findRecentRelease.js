export function findRecentRelease(releases) {
  const latestVersion = Math.max(
    ...releases.map(r => parseInt(r.metadata.labels.version)),
  );

  return releases.find(
    r => parseInt(r.metadata.labels.version) === latestVersion,
  );
}
