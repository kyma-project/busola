import { getTheme } from './utils/theme';

export function createSettings(params) {
  return {
    responsiveNavigation: 'Fiori3',
    sideNavFooterText: ' ', // init empty footer
    header: {
      logo:
        getTheme() === 'hcw' || getTheme() === 'horizon'
          ? 'assets/logo-black.svg'
          : 'assets/logo.svg',
      title: params?.currentContext.cluster.name || '',
      favicon: 'favicon.ico',
    },
    appLoadingIndicator: {
      hideAutomatically: false,
    },
    customSandboxRules: ['allow-downloads'],
  };
}
