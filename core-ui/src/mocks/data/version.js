import { mockGetRequest } from 'mocks/createMock';

export const clusterDetailsVersions = mockGetRequest('/backend/version', {
  major: '1',
  minor: '21',
  gitVersion: 'v1.21.10',
  gitCommit: 'a7a32748b5c60445c4c7ee904caf01b91f2dbb71',
  gitTreeState: 'clean',
  buildDate: '2022-02-16T11:18:16Z',
  goVersion: 'go1.16.14',
  compiler: 'gc',
  platform: 'linux/amd64',
});
