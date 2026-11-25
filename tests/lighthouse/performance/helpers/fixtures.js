export const LARGE_LIST_SIZE = 1000;

/**
 * Build a deterministic Kubernetes PodList with `count` items.
 * Names and fields are stable so measurements are repeatable.
 * @param {number} count
 */
export function generatePodList(count) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const name = `perf-pod-${String(i).padStart(4, '0')}`;
    items.push({
      metadata: {
        name,
        namespace: 'default',
        uid: `uid-${name}`,
        creationTimestamp: '2024-01-01T00:00:00Z',
        resourceVersion: String(1000 + i),
      },
      spec: {
        nodeName: `node-${i % 3}`,
        containers: [{ name: 'main', image: 'nginx:1.0' }],
      },
      status: { phase: i % 2 === 0 ? 'Running' : 'Pending' },
    });
  }
  return {
    kind: 'PodList',
    apiVersion: 'v1',
    metadata: { resourceVersion: '1' },
    items,
  };
}
