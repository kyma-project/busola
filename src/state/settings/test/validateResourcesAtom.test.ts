import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStore } from 'jotai';
import { renderHook, act } from '@testing-library/react';
import {
  getExtendedValidateResourceState,
  validateResourcesAtom,
  ValidateResources,
} from '../validateResourcesAtom';

// ─── getExtendedValidateResourceState ────────────────────────────────────────

describe('getExtendedValidateResourceState', () => {
  it('wraps true in an object with isEnabled: true', () => {
    expect(getExtendedValidateResourceState(true)).toEqual({ isEnabled: true });
  });

  it('wraps false in an object with isEnabled: false', () => {
    expect(getExtendedValidateResourceState(false)).toEqual({
      isEnabled: false,
    });
  });

  it('returns the same object when already ExtendedValidateResources', () => {
    const input = { isEnabled: true, policies: ['p1'], userModified: true };
    expect(getExtendedValidateResourceState(input)).toBe(input);
  });

  it('preserves optional policies field', () => {
    const input = { isEnabled: false, policies: ['a', 'b'] };
    const result = getExtendedValidateResourceState(input);
    expect(result.policies).toEqual(['a', 'b']);
  });

  it('preserves userModified flag', () => {
    const input = { isEnabled: true, userModified: false };
    const result = getExtendedValidateResourceState(input);
    expect(result.userModified).toBe(false);
  });
});

// ─── validateResourcesAtom ───────────────────────────────────────────────────

describe('validateResourcesAtom', () => {
  const STORAGE_KEY = 'busola.validateResources';

  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to true when localStorage has no entry', () => {
    const store = createStore();
    expect(store.get(validateResourcesAtom)).toBe(true);
  });

  it('persists a boolean value to localStorage when set', () => {
    const store = createStore();
    store.set(validateResourcesAtom, false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('false');
  });

  it('persists an object value to localStorage when set', () => {
    const store = createStore();
    const value: ValidateResources = {
      isEnabled: true,
      policies: ['p1'],
      userModified: true,
    };
    store.set(validateResourcesAtom, value);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(value);
  });

  it('stores are isolated — changing one does not affect another', () => {
    const storeA = createStore();
    const storeB = createStore();
    storeA.set(validateResourcesAtom, false);
    expect(storeB.get(validateResourcesAtom)).toBe(true);
  });
});

// ─── useSyncedValidateResources ──────────────────────────────────────────────
//
// The hook depends on two external pieces:
//   1. the validateResourcesAtom value (via useAtom)
//   2. useFeature(RESOURCE_VALIDATION) (via useAtomValue → configurationAtom)
//
// We mock both at the module level to keep tests hermetic and fast.

let mockAtomValue: ValidateResources = true;
const mockSetAtom = vi.fn();
let mockFeatureValue: { isEnabled: boolean; config?: { policies?: string[] } } =
  { isEnabled: false };

vi.mock('jotai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('jotai')>()),
  useAtom: () => [mockAtomValue, mockSetAtom],
  useAtomValue: () => ({ features: {} }),
}));

vi.mock('hooks/useFeature', () => ({
  useFeature: () => mockFeatureValue,
}));

import { useSyncedValidateResources } from '../validateResourcesAtom';

describe('useSyncedValidateResources', () => {
  beforeEach(() => {
    mockAtomValue = true;
    mockSetAtom.mockClear();
    mockFeatureValue = { isEnabled: false };
  });

  describe('returned state — effective policies', () => {
    it('returns isEnabled: true and empty policies when feature is disabled', () => {
      mockAtomValue = true;
      mockFeatureValue = { isEnabled: false };

      const { result } = renderHook(() => useSyncedValidateResources());
      const [state] = result.current;
      expect(state.isEnabled).toBe(true);
      expect(state.policies).toEqual([]);
    });

    it('returns config policies when userModified is false', () => {
      mockAtomValue = {
        isEnabled: true,
        policies: ['user-pol'],
        userModified: false,
      };
      mockFeatureValue = {
        isEnabled: true,
        config: { policies: ['config-pol'] },
      };

      const { result } = renderHook(() => useSyncedValidateResources());
      const [state] = result.current;
      // Admin config takes precedence when user hasn't customised.
      expect(state.policies).toEqual(['config-pol']);
    });

    it('returns user policies when userModified is true', () => {
      mockAtomValue = {
        isEnabled: true,
        policies: ['user-pol'],
        userModified: true,
      };
      mockFeatureValue = {
        isEnabled: true,
        config: { policies: ['config-pol'] },
      };

      const { result } = renderHook(() => useSyncedValidateResources());
      const [state] = result.current;
      expect(state.policies).toEqual(['user-pol']);
    });

    it('falls back to config policies when userModified is true but policies is undefined', () => {
      mockAtomValue = { isEnabled: true, userModified: true };
      mockFeatureValue = {
        isEnabled: true,
        config: { policies: ['config-pol'] },
      };

      const { result } = renderHook(() => useSyncedValidateResources());
      const [state] = result.current;
      expect(state.policies).toEqual(['config-pol']);
    });

    it('reflects isEnabled: false correctly', () => {
      mockAtomValue = { isEnabled: false, policies: [], userModified: false };
      mockFeatureValue = {
        isEnabled: true,
        config: { policies: ['config-pol'] },
      };

      const { result } = renderHook(() => useSyncedValidateResources());
      const [state] = result.current;
      expect(state.isEnabled).toBe(false);
    });
  });

  describe('migration — upgrading old boolean atom value', () => {
    it('calls setValidateResources to upgrade boolean true to object shape', () => {
      mockAtomValue = true;
      mockFeatureValue = {
        isEnabled: true,
        config: { policies: ['pol-a', 'pol-b'] },
      };

      renderHook(() => useSyncedValidateResources());
      act(() => {});

      expect(mockSetAtom).toHaveBeenCalledWith({
        isEnabled: true,
        policies: ['pol-a', 'pol-b'],
        userModified: false,
      });
    });

    it('calls setValidateResources to upgrade boolean false to object shape', () => {
      mockAtomValue = false;
      mockFeatureValue = { isEnabled: true, config: { policies: ['pol-a'] } };

      renderHook(() => useSyncedValidateResources());
      act(() => {});

      expect(mockSetAtom).toHaveBeenCalledWith({
        isEnabled: false,
        policies: ['pol-a'],
        userModified: false,
      });
    });

    it('does NOT call setValidateResources when config has no policies', () => {
      mockAtomValue = true;
      mockFeatureValue = { isEnabled: false };

      renderHook(() => useSyncedValidateResources());
      act(() => {});

      expect(mockSetAtom).not.toHaveBeenCalled();
    });

    it('returns sensible state for boolean atom when feature is disabled', () => {
      mockAtomValue = true;
      mockFeatureValue = { isEnabled: false };

      const { result } = renderHook(() => useSyncedValidateResources());
      const [state] = result.current;
      expect(state.isEnabled).toBe(true);
      expect(state.policies).toEqual([]);
    });
  });

  describe('migration — patching old object without userModified', () => {
    it('calls setValidateResources to sync policies when userModified is undefined', () => {
      mockAtomValue = {
        isEnabled: true,
        policies: ['stale-pol'],
      } as ValidateResources;
      mockFeatureValue = {
        isEnabled: true,
        config: { policies: ['fresh-pol'] },
      };

      renderHook(() => useSyncedValidateResources());
      act(() => {});

      expect(mockSetAtom).toHaveBeenCalledWith({
        isEnabled: true,
        policies: ['fresh-pol'],
        userModified: false,
      });
    });

    it('preserves isEnabled: false when patching missing userModified', () => {
      mockAtomValue = {
        isEnabled: false,
        policies: ['stale-pol'],
      } as ValidateResources;
      mockFeatureValue = {
        isEnabled: true,
        config: { policies: ['fresh-pol'] },
      };

      renderHook(() => useSyncedValidateResources());
      act(() => {});

      expect(mockSetAtom).toHaveBeenCalledWith({
        isEnabled: false,
        policies: ['fresh-pol'],
        userModified: false,
      });
    });

    it('does NOT call setValidateResources when userModified is already set', () => {
      mockAtomValue = {
        isEnabled: true,
        policies: ['p1'],
        userModified: false,
      };
      mockFeatureValue = {
        isEnabled: true,
        config: { policies: ['config-pol'] },
      };

      renderHook(() => useSyncedValidateResources());
      act(() => {});

      expect(mockSetAtom).not.toHaveBeenCalled();
    });
  });

  describe('setValidateResources setter', () => {
    it('returns a setter function as the second element', () => {
      const { result } = renderHook(() => useSyncedValidateResources());
      const [, setter] = result.current;
      expect(typeof setter).toBe('function');
    });

    it('setter is the atom setter from useAtom', () => {
      const { result } = renderHook(() => useSyncedValidateResources());
      const [, setter] = result.current;
      expect(setter).toBe(mockSetAtom);
    });
  });
});
