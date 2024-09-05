export function joinPaths(...paths: string[]): string {
  const procceseedPath = paths
    .map(item => item.replaceAll('/', ''))
    .join('/')
    .toString();
  return '/' + procceseedPath;
}

export default joinPaths;
