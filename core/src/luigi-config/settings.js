import { getTheme } from './utils/theme';

export function createSettings(params) {
  const json = require('json-loader!./version.json');
  return {
    responsiveNavigation: 'Fiori3',
    sideNavFooterText: json.get('version'),
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
