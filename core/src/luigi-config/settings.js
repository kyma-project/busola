import { getTheme } from './utils/theme';

async function getBusolaVersion() {
  return await fetch('/assets/version.json')
    .then(response => response.json())
    .then(json => json.version)
    .catch(() => 'unknown');
}

export async function createSettings(params) {
  return {
    responsiveNavigation: 'Fiori3',
    sideNavFooterText: 'Version: ' + (await getBusolaVersion()),
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
