import { describe, it, expect } from 'vitest';
import { areNodeFeaturesEnabled } from './areNodeFeaturesEnabled';
import { NavNode } from '../../types';
import { ConfigFeatureList } from '../../types';

const baseNode: NavNode = {
  resourceType: 'pods',
  resourceTypeCased: 'Pods',
  category: 'Workloads',
  namespaced: true,
  label: 'Pods',
  pathSegment: 'pods',
  requiredFeatures: [],
  apiVersion: 'v1',
  apiGroup: '',
};

describe('areNodeFeaturesEnabled', () => {
  it('returns true when node has no requiredFeatures', () => {
    expect(areNodeFeaturesEnabled(baseNode, {})).toBe(true);
  });

  it('returns true when requiredFeatures is an empty array', () => {
    const node = { ...baseNode, requiredFeatures: [] };
    expect(
      areNodeFeaturesEnabled(node, {
        EXTENSIBILITY: { isEnabled: false },
      } as ConfigFeatureList),
    ).toBe(true);
  });

  it('returns true when all required features are enabled', () => {
    const node = { ...baseNode, requiredFeatures: ['EXTENSIBILITY' as const] };
    const features: ConfigFeatureList = { EXTENSIBILITY: { isEnabled: true } };
    expect(areNodeFeaturesEnabled(node, features)).toBe(true);
  });

  it('returns false when a required feature is explicitly disabled', () => {
    const node = { ...baseNode, requiredFeatures: ['EXTENSIBILITY' as const] };
    const features: ConfigFeatureList = { EXTENSIBILITY: { isEnabled: false } };
    expect(areNodeFeaturesEnabled(node, features)).toBe(false);
  });

  it('returns true when a required feature is absent from the config (not disabled)', () => {
    const node = { ...baseNode, requiredFeatures: ['EXTENSIBILITY' as const] };
    const features: ConfigFeatureList = {};
    expect(areNodeFeaturesEnabled(node, features)).toBe(true);
  });

  it('returns false when any one of multiple required features is disabled', () => {
    const node = {
      ...baseNode,
      requiredFeatures: ['EXTENSIBILITY' as const, 'TERMINAL' as const],
    };
    const features: ConfigFeatureList = {
      EXTENSIBILITY: { isEnabled: true },
      TERMINAL: { isEnabled: false },
    };
    expect(areNodeFeaturesEnabled(node, features)).toBe(false);
  });

  it('returns true when configFeatures is null/undefined (treated as empty)', () => {
    const node = { ...baseNode, requiredFeatures: ['EXTENSIBILITY' as const] };
    expect(
      areNodeFeaturesEnabled(node, null as unknown as ConfigFeatureList),
    ).toBe(true);
  });
});
