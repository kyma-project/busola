import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockSetThemeRoot = vi.hoisted(() => vi.fn());

vi.mock('@ui5/webcomponents-base/dist/config/Theme', () => ({
  setTheme: vi.fn(),
}));

vi.mock('@ui5/webcomponents-base/dist/config/ThemeRoot', () => ({
  setThemeRoot: mockSetThemeRoot,
}));

import { applyUI5BootstrapUrl } from '../initTheme';

const VALID_URL = 'https://sapui5.example.com/resources';
const META_NAME = 'sap-allowed-theme-origins';

function getOriginMeta() {
  return document.querySelector<HTMLMetaElement>(`meta[name="${META_NAME}"]`);
}

describe('applyUI5BootstrapUrl', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    mockSetThemeRoot.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing for an empty string', () => {
    applyUI5BootstrapUrl('');
    expect(getOriginMeta()).toBeNull();
    expect(mockSetThemeRoot).not.toHaveBeenCalled();
  });

  it('appends the allowlist meta tag with the correct origin', () => {
    applyUI5BootstrapUrl(VALID_URL);
    const meta = getOriginMeta();
    expect(meta).not.toBeNull();
    expect(meta?.content).toBe('https://sapui5.example.com');
  });

  it('calls setThemeRoot with the full URL', () => {
    applyUI5BootstrapUrl(VALID_URL);
    expect(mockSetThemeRoot).toHaveBeenCalledWith(VALID_URL);
  });

  it('does not add a duplicate meta tag on repeated calls', () => {
    applyUI5BootstrapUrl(VALID_URL);
    applyUI5BootstrapUrl(VALID_URL);
    const metas = document.querySelectorAll(`meta[name="${META_NAME}"]`);
    expect(metas).toHaveLength(1);
  });

  it('logs an error and skips setThemeRoot for an invalid URL', () => {
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    applyUI5BootstrapUrl('not-a-valid-url');
    expect(consoleSpy).toHaveBeenCalled();
    expect(mockSetThemeRoot).not.toHaveBeenCalled();
    expect(getOriginMeta()).toBeNull();
  });
});
