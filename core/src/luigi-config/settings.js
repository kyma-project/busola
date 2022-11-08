import { getCurrentConfig } from './cluster-management/cluster-management';
import { elementReady } from './nav-footer';
import { getTheme } from './utils/theme';

export async function createSettings(params) {
  const { features } = (await getCurrentConfig()) || {};

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
    hideNavigation: !!features?.REACT_NAVIGATION?.isEnabled,
  };
}

export async function attachPreferencesModal() {
  elementReady(`[data-testid=luigi-topnav-profile-item]`).then(
    async preferencesElement => {
      preferencesElement.addEventListener('click', () => {
        Luigi.customMessages().sendToAll({
          id: 'open-preferences',
        });
      });
    },
  );
}
