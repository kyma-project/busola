import { describe, it, expect } from 'vitest';
import { createExternalNode, getExternalNodes } from '../externalNodesAtom';

describe('createExternalNode', () => {
  it('builds a node with all expected fields', () => {
    const node = createExternalNode(
      'https://example.com',
      'My Link',
      'Tools',
      'world',
      'namespace',
    );
    expect(node.externalUrl).toBe('https://example.com');
    expect(node.label).toBe('My Link');
    expect(node.category).toBe('Tools');
    expect(node.icon).toBe('world');
    expect(node.namespaced).toBe(true);
    expect(node.resourceType).toBe('');
    expect(node.pathSegment).toBe('');
    expect(node.requiredFeatures).toEqual([]);
  });

  it('marks node as non-namespaced for cluster scope', () => {
    const node = createExternalNode(
      'https://example.com',
      'X',
      'Cat',
      'icon',
      'cluster',
    );
    expect(node.namespaced).toBe(false);
  });

  it('marks node as non-namespaced when scope is undefined', () => {
    const node = createExternalNode('https://example.com', 'X', 'Cat');
    expect(node.namespaced).toBe(false);
  });

  it('prepends https:// when url has no protocol', () => {
    const node = createExternalNode('example.com', 'X', 'Cat');
    expect(node.externalUrl).toBe('https://example.com');
  });

  it('does not double-prepend https:// when url already has protocol', () => {
    const node = createExternalNode('https://example.com', 'X', 'Cat');
    expect(node.externalUrl).toBe('https://example.com');
  });

  it('preserves http:// urls as-is', () => {
    const node = createExternalNode('http://internal.example.com', 'X', 'Cat');
    expect(node.externalUrl).toBe('http://internal.example.com');
  });

  it('sets icon to undefined when not provided', () => {
    const node = createExternalNode('https://example.com', 'X', 'Cat');
    expect(node.icon).toBeUndefined();
  });
});

describe('getExternalNodes', () => {
  it('returns empty array when nodes list is empty', () => {
    const result = getExternalNodes({ isEnabled: true, nodes: [] });
    expect(result).toEqual([]);
  });

  it('returns empty array when nodes is undefined', () => {
    const result = getExternalNodes({ isEnabled: true });
    expect(result).toEqual([]);
  });

  it('maps a single category with one child to one node', () => {
    const feature = {
      isEnabled: true,
      nodes: [
        {
          category: 'Tools',
          icon: 'world',
          scope: 'cluster',
          children: [{ label: 'Grafana', link: 'https://grafana.example.com' }],
        },
      ],
    };
    const result = getExternalNodes(feature);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('Grafana');
    expect(result[0].externalUrl).toBe('https://grafana.example.com');
    expect(result[0].category).toBe('Tools');
    expect(result[0].namespaced).toBe(false);
  });

  it('maps multiple children to multiple nodes', () => {
    const feature = {
      isEnabled: true,
      nodes: [
        {
          category: 'Tools',
          icon: 'world',
          children: [
            { label: 'Grafana', link: 'https://grafana.example.com' },
            { label: 'Jaeger', link: 'https://jaeger.example.com' },
          ],
        },
      ],
    };
    const result = getExternalNodes(feature);
    expect(result).toHaveLength(2);
    expect(result[0].label).toBe('Grafana');
    expect(result[1].label).toBe('Jaeger');
  });

  it('handles multiple categories independently', () => {
    const feature = {
      isEnabled: true,
      nodes: [
        {
          category: 'Observability',
          icon: 'chart',
          children: [{ label: 'Metrics', link: 'https://metrics.example.com' }],
        },
        {
          category: 'CI/CD',
          icon: 'pipeline',
          children: [{ label: 'Jenkins', link: 'https://jenkins.example.com' }],
        },
      ],
    };
    const result = getExternalNodes(feature);
    expect(result).toHaveLength(2);
    expect(result[0].category).toBe('Observability');
    expect(result[1].category).toBe('CI/CD');
  });

  it('marks nodes as namespaced for namespace scope', () => {
    const feature = {
      isEnabled: true,
      nodes: [
        {
          category: 'Tools',
          icon: 'world',
          scope: 'namespace',
          children: [{ label: 'X', link: 'https://x.example.com' }],
        },
      ],
    };
    const result = getExternalNodes(feature);
    expect(result[0].namespaced).toBe(true);
  });

  it('prepends https:// for protocol-less urls', () => {
    const feature = {
      isEnabled: true,
      nodes: [
        {
          category: 'Tools',
          icon: 'world',
          children: [{ label: 'X', link: 'no-protocol.example.com' }],
        },
      ],
    };
    const result = getExternalNodes(feature);
    expect(result[0].externalUrl).toBe('https://no-protocol.example.com');
  });
});
