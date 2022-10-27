import { elementReady } from './nav-footer';
import { getTheme } from './utils/theme';

export function createSettings(params) {
  return {
    responsiveNavigation: 'Fiori3',
    sideNavFooterText: ' ', // init empty footer
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

export async function attachPreferencesModal() {
  elementReady('[data-testid=preferences]').then(async preferencesButton => {
    preferencesButton.addEventListener('click', () => {
      Luigi.customMessages().sendToAll({
        id: 'open-preferences',
      });
    });
  });
}
