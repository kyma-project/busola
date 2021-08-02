import { getTheme } from './utils/theme';

export function createSettings(params) {
  return {
    responsiveNavigation: 'Fiori3',
    sideNavFooterText: '',
    header: {
      logo: getTheme() === 'hcw' ? 'assets/logo-black.svg' : 'assets/logo.svg',
      title: params?.currentContext.cluster.name || 'Busola',
      favicon: 'favicon.ico',
    },
    appLoadingIndicator: {
      hideAutomatically: false,
    },
    customSandboxRules: ['allow-downloads'],
  };
}
