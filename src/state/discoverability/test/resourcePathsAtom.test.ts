import { describe, it, expect } from 'vitest';
import { aggregatedDiscoveryPathIds } from '../resourcePathsAtom';

const coreResponse = {
  kind: 'APIGroupDiscoveryList',
  items: [
    {
      metadata: { name: '' },
      versions: [
        {
          version: 'v1',
          resources: [{ resource: 'pods' }, { resource: 'configmaps' }],
        },
      ],
    },
  ],
};

const apisResponse = {
  kind: 'APIGroupDiscoveryList',
  items: [
    {
      metadata: { name: 'apps' },
      versions: [{ version: 'v1', resources: [{ resource: 'deployments' }] }],
    },
    {
      metadata: { name: 'rbac.authorization.k8s.io' },
      versions: [{ version: 'v1', resources: [{ resource: 'roles' }] }],
    },
  ],
};

describe('aggregatedDiscoveryPathIds', () => {
  it('builds core-group paths under /api and grouped paths under /apis', () => {
    const result = aggregatedDiscoveryPathIds([coreResponse, apisResponse]);
    expect(result).toContain('/api/v1/pods');
    expect(result).toContain('/api/v1/configmaps');
    expect(result).toContain('/apis/apps/v1/deployments');
    expect(result).toContain('/apis/rbac.authorization.k8s.io/v1/roles');
  });

  it('lowercases group, version and resource in the path-id', () => {
    const result = aggregatedDiscoveryPathIds([
      {
        kind: 'APIGroupDiscoveryList',
        items: [
          {
            metadata: { name: 'Example.Group' },
            versions: [{ version: 'V1', resources: [{ resource: 'Widgets' }] }],
          },
        ],
      },
    ]);
    expect(result).toEqual(['/apis/example.group/v1/widgets']);
  });

  it('returns null when any response is not the aggregated format', () => {
    expect(
      aggregatedDiscoveryPathIds([coreResponse, { kind: 'APIGroupList' }]),
    ).toBeNull();
    expect(aggregatedDiscoveryPathIds([null])).toBeNull();
  });

  it('tolerates missing or empty fields', () => {
    const result = aggregatedDiscoveryPathIds([
      {
        kind: 'APIGroupDiscoveryList',
        items: [{ metadata: { name: 'foo' }, versions: [] }],
      },
    ]);
    expect(result).toEqual([]);
  });
});
