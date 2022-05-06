import { getTheme } from './utils/theme';

export function createSettings(currentCluster) {
  return {
    responsiveNavigation: 'Fiori3',
    sideNavFooterText: ' ', // init empty footer
    header: {
      logo: getTheme() === 'hcw' ? 'assets/logo-black.svg' : 'assets/logo.svg',
      title: currentCluster?.currentContext.cluster.name || '',
      favicon: 'favicon.ico',
    },
    appLoadingIndicator: {
      hideAutomatically: false,
    },
    customSandboxRules: ['allow-downloads'],
  };
}
