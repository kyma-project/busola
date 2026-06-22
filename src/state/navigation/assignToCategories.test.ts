import { describe, it, expect } from 'vitest';
import { assignNodesToCategories } from './assignToCategories';
import { NavNode } from '../types';
import { predefinedCategories } from './categories';

const makeNode = (overrides: Partial<NavNode> = {}): NavNode => ({
  resourceType: 'pods',
  resourceTypeCased: 'Pods',
  category: predefinedCategories.workloads,
  namespaced: true,
  label: 'Pods',
  pathSegment: 'pods',
  requiredFeatures: [],
  apiVersion: 'v1',
  apiGroup: '',
  ...overrides,
});

describe('assignNodesToCategories', () => {
  it('returns all predefined categories for an empty node list', () => {
    const result = assignNodesToCategories([]);
    expect(result.length).toBe(8);
    expect(result.every((cat) => cat.items.length === 0)).toBe(true);
  });

  it('appends a node to an existing predefined category', () => {
    const node = makeNode({
      category: predefinedCategories.workloads,
      label: 'Pods',
    });
    const result = assignNodesToCategories([node]);
    const workloads = result.find(
      (c) => c.key === predefinedCategories.workloads,
    );
    expect(workloads?.items).toHaveLength(1);
    expect(workloads?.items[0].label).toBe('Pods');
  });

  it('strips icon from nodes placed in an existing category', () => {
    const node = makeNode({
      category: predefinedCategories.workloads,
      icon: 'some-icon',
    });
    const result = assignNodesToCategories([node]);
    const workloads = result.find(
      (c) => c.key === predefinedCategories.workloads,
    );
    expect(workloads?.items[0].icon).toBeUndefined();
  });

  it('creates a new category for unknown category keys', () => {
    const node = makeNode({
      category: 'custom-category',
      label: 'My Resource',
    });
    const result = assignNodesToCategories([node]);
    const custom = result.find((c) => (c.key as string) === 'custom-category');
    expect(custom).toBeDefined();
    expect(custom?.items).toHaveLength(1);
  });

  it('uses the node label as category label when category key is unknown', () => {
    const node = makeNode({
      category: 'custom-category',
      label: 'My Resource',
    });
    const result = assignNodesToCategories([node]);
    const custom = result.find((c) => (c.key as string) === 'custom-category');
    expect(custom?.label).toBe('custom-category');
  });

  it('uses node icon for a new custom category', () => {
    const node = makeNode({ category: 'custom-category', icon: 'my-icon' });
    const result = assignNodesToCategories([node]);
    const custom = result.find((c) => (c.key as string) === 'custom-category');
    expect(custom?.icon).toBe('my-icon');
  });

  it('falls back to "customize" icon for a new custom category with no icon', () => {
    const node = makeNode({ category: 'custom-category', icon: undefined });
    const result = assignNodesToCategories([node]);
    const custom = result.find((c) => (c.key as string) === 'custom-category');
    expect(custom?.icon).toBe('customize');
  });

  it('unshifts a topLevelNode as its own category at the front', () => {
    const topNode = makeNode({
      topLevelNode: true,
      label: 'Overview',
      icon: 'home',
    });
    const result = assignNodesToCategories([topNode]);
    expect(result[0].topLevelNode).toBe(true);
    expect(result[0].items[0].label).toBe('Overview');
    expect(result[0].icon).toBe('home');
  });

  it('topLevelNode with no icon uses "customize"', () => {
    const topNode = makeNode({ topLevelNode: true, icon: undefined });
    const result = assignNodesToCategories([topNode]);
    expect(result[0].icon).toBe('customize');
  });

  it('sorts items within each category alphabetically by label', () => {
    const zebra = makeNode({
      category: predefinedCategories.workloads,
      label: 'Zebra',
      resourceType: 'zebras',
      pathSegment: 'zebras',
    });
    const alpha = makeNode({
      category: predefinedCategories.workloads,
      label: 'Alpha',
      resourceType: 'alphas',
      pathSegment: 'alphas',
    });
    const result = assignNodesToCategories([zebra, alpha]);
    const workloads = result.find(
      (c) => c.key === predefinedCategories.workloads,
    );
    expect(workloads?.items[0].label).toBe('Alpha');
    expect(workloads?.items[1].label).toBe('Zebra');
  });

  it('multiple nodes spread across different predefined categories', () => {
    const workloadNode = makeNode({
      category: predefinedCategories.workloads,
      label: 'Pods',
    });
    const storageNode = makeNode({
      category: predefinedCategories.storage,
      label: 'PVCs',
      resourceType: 'pvcs',
      pathSegment: 'pvcs',
    });
    const result = assignNodesToCategories([workloadNode, storageNode]);
    expect(
      result.find((c) => c.key === predefinedCategories.workloads)?.items,
    ).toHaveLength(1);
    expect(
      result.find((c) => c.key === predefinedCategories.storage)?.items,
    ).toHaveLength(1);
  });
});
