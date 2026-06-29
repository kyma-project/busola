import { describe, it, expect } from 'vitest';
import {
  createExternalNode,
  getExtensibilityNodesExt,
} from '../extensibilityNodesExtAtom';
import { ExtResource } from '../../types';

const makeExtResource = (externalNodes: any): Partial<ExtResource> => ({
  general: { externalNodes } as any,
  dataSources: { someSource: {} } as any,
});

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

  it('marks node as non-namespaced when scope is empty string', () => {
    const node = createExternalNode(
      'https://example.com',
      'X',
      'Cat',
      'icon',
      '',
    );
    expect(node.namespaced).toBe(false);
  });

  it('stores dataSources on the node', () => {
    const ds = { mySource: {} } as any;
    const node = createExternalNode(
      'https://example.com',
      'X',
      'Cat',
      'icon',
      'cluster',
      ds,
    );
    expect(node.dataSources).toBe(ds);
  });

  it('dataSources is undefined when not provided', () => {
    const node = createExternalNode(
      'https://example.com',
      'X',
      'Cat',
      'icon',
      'cluster',
    );
    expect(node.dataSources).toBeUndefined();
  });
});

describe('getExtensibilityNodesExt', () => {
  it('returns empty array for empty extensions list', () => {
    expect(getExtensibilityNodesExt([])).toEqual([]);
  });

  it('returns empty array when no extension has externalNodes', () => {
    const ext = { general: {} } as any;
    expect(getExtensibilityNodesExt([ext])).toEqual([]);
  });

  it('maps a single externalNode entry with one child', () => {
    const ext = makeExtResource([
      {
        category: 'Tools',
        icon: 'world',
        scope: 'cluster',
        children: [{ label: 'Grafana', link: 'https://grafana.example.com' }],
      },
    ]) as ExtResource;
    const result = getExtensibilityNodesExt([ext]);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('Grafana');
    expect(result[0].externalUrl).toBe('https://grafana.example.com');
    expect(result[0].category).toBe('Tools');
    expect(result[0].namespaced).toBe(false);
  });

  it('maps multiple children to multiple nodes', () => {
    const ext = makeExtResource([
      {
        category: 'Tools',
        icon: 'world',
        scope: 'cluster',
        children: [
          { label: 'Grafana', link: 'https://grafana.example.com' },
          { label: 'Jaeger', link: 'https://jaeger.example.com' },
        ],
      },
    ]) as ExtResource;
    const result = getExtensibilityNodesExt([ext]);
    expect(result).toHaveLength(2);
    expect(result[0].label).toBe('Grafana');
    expect(result[1].label).toBe('Jaeger');
  });

  it('propagates dataSources from the extension config to each node', () => {
    const ds = { mySource: {} } as any;
    const ext: ExtResource = {
      ...makeExtResource([
        {
          category: 'Tools',
          icon: 'world',
          scope: 'cluster',
          children: [{ label: 'X', link: 'https://x.example.com' }],
        },
      ]),
      dataSources: ds,
    } as ExtResource;
    const result = getExtensibilityNodesExt([ext]);
    expect(result[0].dataSources).toBe(ds);
  });

  it('marks nodes as namespaced for namespace scope', () => {
    const ext = makeExtResource([
      {
        category: 'Tools',
        icon: 'world',
        scope: 'namespace',
        children: [{ label: 'X', link: 'https://x.example.com' }],
      },
    ]) as ExtResource;
    const result = getExtensibilityNodesExt([ext]);
    expect(result[0].namespaced).toBe(true);
  });

  it('skips extensions without externalNodes and maps those that have them', () => {
    const extWithout = { general: {} } as any;
    const extWith = makeExtResource([
      {
        category: 'Tools',
        icon: 'world',
        scope: 'cluster',
        children: [{ label: 'X', link: 'https://x.example.com' }],
      },
    ]) as ExtResource;
    const result = getExtensibilityNodesExt([extWithout, extWith]);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('X');
  });

  it('handles multiple extensions each with externalNodes', () => {
    const ext1 = makeExtResource([
      {
        category: 'A',
        icon: 'icon-a',
        scope: 'cluster',
        children: [{ label: 'NodeA', link: 'https://a.example.com' }],
      },
    ]) as ExtResource;
    const ext2 = makeExtResource([
      {
        category: 'B',
        icon: 'icon-b',
        scope: 'namespace',
        children: [{ label: 'NodeB', link: 'https://b.example.com' }],
      },
    ]) as ExtResource;
    const result = getExtensibilityNodesExt([ext1, ext2]);
    expect(result).toHaveLength(2);
    expect(result[0].category).toBe('A');
    expect(result[1].category).toBe('B');
    expect(result[1].namespaced).toBe(true);
  });
});
