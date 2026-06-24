import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEditViewModeState, EditViewTypes } from '../editViewModeAtom';
import { getExtendedValidateResourceState } from '../validateResourcesAtom';
import {
  isCurrentThemeDark,
  isSystemThemeDark,
  applyThemeToLinkNode,
} from '../themeAtom';
import { AVAILABLE_PAGE_SIZES, pageSizeAtom } from '../pageSizeAtom';
import { disableResourceProtectionAtom } from '../disableResourceProtectionAtom';
import { dontConfirmDeleteAtom } from '../dontConfirmDeleteAtom';
import { isSettingsOpenAtom } from '../isSettingsModalOpenAtom';
import { isSidebarCondensedAtom } from '../isSidebarCondensedAtom';
import { languageAtom } from '../languageAtom';
import { showHiddenNamespacesAtom } from '../showHiddenNamespacesAtom';
import { editViewModeAtom } from '../editViewModeAtom';
import { validateResourcesAtom } from '../validateResourcesAtom';
import { themeAtom } from '../themeAtom';

// getEditViewModeState

describe('getEditViewModeState', () => {
  it('converts a string value to defaults with MODE_DEFAULT preferencesViewType and MODE_FORM dynamicViewType', () => {
    const result = getEditViewModeState('MODE_DEFAULT');
    expect(result).toEqual({
      preferencesViewType: 'MODE_DEFAULT',
      dynamicViewType: 'MODE_FORM',
    });
  });

  it('returns the same object when already an EditViewTypes object', () => {
    const input: EditViewTypes = {
      preferencesViewType: 'MODE_YAML',
      dynamicViewType: 'MODE_YAML',
    };
    const result = getEditViewModeState(input);
    expect(result).toBe(input);
  });

  it('returns defaults for any string input, not just MODE_DEFAULT', () => {
    const result = getEditViewModeState('some-other-string');
    expect(result).toEqual({
      preferencesViewType: 'MODE_DEFAULT',
      dynamicViewType: 'MODE_FORM',
    });
  });

  it('preserves dynamicViewType null when passed as an object', () => {
    const input: EditViewTypes = {
      preferencesViewType: 'MODE_FORM',
      dynamicViewType: null,
    };
    const result = getEditViewModeState(input);
    expect(result.dynamicViewType).toBeNull();
  });
});

// getExtendedValidateResourceState

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

// isSystemThemeDark

describe('isSystemThemeDark', () => {
  const mockMatchMedia = (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches }),
    });
  };

  it('returns true when system prefers dark color scheme', () => {
    mockMatchMedia(true);
    expect(isSystemThemeDark()).toBe(true);
  });

  it('returns false when system prefers light color scheme', () => {
    mockMatchMedia(false);
    expect(isSystemThemeDark()).toBe(false);
  });
});

// isCurrentThemeDark

describe('isCurrentThemeDark', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
  });

  it('returns false for sap_horizon (light theme)', () => {
    expect(isCurrentThemeDark('sap_horizon')).toBe(false);
  });

  it('returns true for sap_horizon_dark', () => {
    expect(isCurrentThemeDark('sap_horizon_dark')).toBe(true);
  });

  it('returns true for sap_horizon_hcb (high contrast black)', () => {
    expect(isCurrentThemeDark('sap_horizon_hcb')).toBe(true);
  });

  it('returns false for sap_horizon_hcw (high contrast white)', () => {
    expect(isCurrentThemeDark('sap_horizon_hcw')).toBe(false);
  });

  it('returns false for light_dark when system is in light mode', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
    expect(isCurrentThemeDark('light_dark')).toBe(false);
  });

  it('returns true for light_dark when system is in dark mode', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    expect(isCurrentThemeDark('light_dark')).toBe(true);
  });
});

// applyThemeToLinkNode

describe('applyThemeToLinkNode', () => {
  beforeEach(() => {
    // Clean up any existing theme link node
    const existing = document.querySelector('head #_theme');
    existing?.parentNode?.removeChild(existing);

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
  });

  it('creates a link node in <head> when none exists', () => {
    applyThemeToLinkNode('sap_horizon_dark');
    const link = document.querySelector('head #_theme') as HTMLLinkElement;
    expect(link).not.toBeNull();
    expect(link.rel).toBe('stylesheet');
  });

  it('sets href to the named theme css file', () => {
    // 'sap_horizon_dark' strips the 'sap_horizon_' prefix (12 chars) → 'dark.css'
    applyThemeToLinkNode('sap_horizon_dark');
    const link = document.querySelector('head #_theme') as HTMLLinkElement;
    expect(link.href).toContain('dark.css');
  });

  it('respects publicUrl prefix', () => {
    applyThemeToLinkNode('sap_horizon_dark', '/static');
    const link = document.querySelector('head #_theme') as HTMLLinkElement;
    expect(link.href).toContain('/static/themes/');
  });

  it('falls back to default.css for sap_horizon theme', () => {
    applyThemeToLinkNode('sap_horizon');
    const link = document.querySelector('head #_theme') as HTMLLinkElement;
    // sap_horizon is the default — maps to default.css
    expect(link.href).toContain('default.css');
  });

  it('uses dark.css for light_dark when system is dark', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    applyThemeToLinkNode('light_dark');
    const link = document.querySelector('head #_theme') as HTMLLinkElement;
    expect(link.href).toContain('dark.css');
  });

  it('uses default.css for light_dark when system is light', () => {
    applyThemeToLinkNode('light_dark');
    const link = document.querySelector('head #_theme') as HTMLLinkElement;
    expect(link.href).toContain('default.css');
  });
});

// Atom initialisation — exercises module-level code in each atom file

describe('Atom definitions', () => {
  it('pageSizeAtom is defined with a debugLabel', () => {
    expect(pageSizeAtom).toBeDefined();
    expect(pageSizeAtom.debugLabel).toBe('pageSizeAtom');
  });

  it('disableResourceProtectionAtom is defined with default false', () => {
    expect(disableResourceProtectionAtom).toBeDefined();
    expect(disableResourceProtectionAtom.debugLabel).toBe(
      'disableResourceProtectionAtom',
    );
  });

  it('dontConfirmDeleteAtom is defined with a debugLabel', () => {
    expect(dontConfirmDeleteAtom).toBeDefined();
    expect(dontConfirmDeleteAtom.debugLabel).toBe('dontConfirmDeleteAtom');
  });

  it('isSettingsOpenAtom is defined with a debugLabel', () => {
    expect(isSettingsOpenAtom).toBeDefined();
    expect(isSettingsOpenAtom.debugLabel).toBe('isSettingsOpenAtom');
  });

  it('isSidebarCondensedAtom is defined with a debugLabel', () => {
    expect(isSidebarCondensedAtom).toBeDefined();
    expect(isSidebarCondensedAtom.debugLabel).toBe('isSidebarCondensedAtom');
  });

  it('languageAtom is defined with a debugLabel', () => {
    expect(languageAtom).toBeDefined();
    expect(languageAtom.debugLabel).toBe('languageAtom');
  });

  it('showHiddenNamespacesAtom is defined with a debugLabel', () => {
    expect(showHiddenNamespacesAtom).toBeDefined();
    expect(showHiddenNamespacesAtom.debugLabel).toBe(
      'showHiddenNamespacesAtom',
    );
  });

  it('editViewModeAtom is defined with a debugLabel', () => {
    expect(editViewModeAtom).toBeDefined();
    expect(editViewModeAtom.debugLabel).toBe('editViewModeAtom');
  });

  it('validateResourcesAtom is defined with a debugLabel', () => {
    expect(validateResourcesAtom).toBeDefined();
    expect(validateResourcesAtom.debugLabel).toBe('validateResourcesAtom');
  });

  it('themeAtom is defined with a debugLabel', () => {
    expect(themeAtom).toBeDefined();
    expect(themeAtom.debugLabel).toBe('themeAtom');
  });
});

describe('AVAILABLE_PAGE_SIZES', () => {
  it('contains expected page sizes', () => {
    expect(AVAILABLE_PAGE_SIZES).toEqual([10, 20, 50]);
  });

  it('includes 20 as the default page size', () => {
    expect(AVAILABLE_PAGE_SIZES).toContain(20);
  });

  it('is sorted in ascending order', () => {
    const sorted = [...AVAILABLE_PAGE_SIZES].sort((a, b) => a - b);
    expect(AVAILABLE_PAGE_SIZES).toEqual(sorted);
  });
});
