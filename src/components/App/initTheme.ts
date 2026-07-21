import { isSystemThemeDark } from 'state/settings/themeAtom';
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme';
import { setThemeRoot } from '@ui5/webcomponents-base/dist/config/ThemeRoot';

// you must initially load the themeAtom to
//let the App know what theme to choose
export const initTheme = (theme: string) => {
  if (theme === 'light_dark') {
    if (isSystemThemeDark()) setTheme('sap_horizon_dark');
    else setTheme('sap_horizon');
  } else {
    setTheme(theme);
  }
};

/**
 * Configures UI5 to load theme assets from a custom SAPUI5 Cloud Service URL.
 * Required for GDC air-gapped deployments where the standard CDN is unreachable.
 * The URL must point to the SAPUI5 instance installed within the GDC-A environment.
 */
export const applyUI5BootstrapUrl = (sapui5BootstrapUrl: string) => {
  if (!sapui5BootstrapUrl) return;

  // UI5 Web Components requires an explicit allowlist before it will fetch
  // theme assets from a cross-origin URL.
  const metaName = 'sap-allowed-theme-origins';
  if (!document.querySelector(`meta[name="${metaName}"]`)) {
    const meta = document.createElement('meta');
    meta.name = metaName;
    meta.content = new URL(sapui5BootstrapUrl).origin;
    document.head.appendChild(meta);
  }

  setThemeRoot(sapui5BootstrapUrl);
};
