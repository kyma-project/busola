import { getTheme } from './utils/theme';

export async function createSettings(params) {
  return {
    responsiveNavigation: 'Fiori3',
    header: {
      logo: getTheme() === 'hcw' ? 'assets/logo-black.svg' : 'assets/logo.svg',
      title: params?.currentContext.cluster.name || '',
      favicon: 'favicon.ico',
    },
    appLoadingIndicator: {
      hideAutomatically: false,
    },
    customSandboxRules: ['allow-downloads'],
  };
}
