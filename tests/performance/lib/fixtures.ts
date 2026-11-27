export type DatasetSize = 'small' | 'medium' | 'large';

const SIZES: Record<DatasetSize, number> = {
  small: 10,
  medium: 100,
  large: 1000,
};

const SECRET_TYPES = [
  'Opaque',
  'kubernetes.io/service-account-token',
  'kubernetes.io/tls',
  'kubernetes.io/dockerconfigjson',
  'kubernetes.io/basic-auth',
];

export function generateEntries(size: DatasetSize) {
  const count = SIZES[size];
  return Array.from({ length: count }, (_, i) => ({
    id: `resource-${i}`,
    name: `resource-${i}`,
    description: `Description for resource ${i}`,
    type: SECRET_TYPES[i % SECRET_TYPES.length],
    metadata: {
      name: `resource-${i}`,
      namespace: 'default',
      uid: `uid-${i}`,
      creationTimestamp: new Date(Date.now() - i * 60_000).toISOString(),
      labels: {
        app: `app-${i % 10}`,
        env: i % 2 === 0 ? 'prod' : 'dev',
        team: `team-${i % 5}`,
      },
    },
  }));
}
