import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  applyThemeToLinkNode,
  isCurrentThemeDark,
  isSystemThemeDark,
} from '../themeAtom';

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

  describe('when a link node already exists', () => {
    beforeEach(() => {
      const link = document.createElement('link');
      link.id = '_theme';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    });

    it('removes the existing link node when called with sap_horizon', () => {
      applyThemeToLinkNode('sap_horizon');
      expect(document.querySelector('head #_theme')).toBeNull();
    });

    it('sets href to dark.css for light_dark when system is dark', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockReturnValue({ matches: true }),
      });
      applyThemeToLinkNode('light_dark');
      const link = document.querySelector('head #_theme') as HTMLLinkElement;
      expect(link.href).toContain('dark.css');
    });

    it('sets href to default.css for light_dark when system is light', () => {
      applyThemeToLinkNode('light_dark');
      const link = document.querySelector('head #_theme') as HTMLLinkElement;
      expect(link.href).toContain('default.css');
    });
  });
});
