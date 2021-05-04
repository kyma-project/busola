export function createSettings({ cluster }) {
  const title =
    cluster.name || cluster.server.replace(/^https?:\/\/(api\.)?/, '');
  return {
    responsiveNavigation: 'simpleMobileOnly',
    sideNavFooterText: '',
    header: {
      logo: 'assets/logo.svg',
      title,
      favicon: 'favicon.ico',
    },
    appLoadingIndicator: {
      hideAutomatically: false,
    },
    customSandboxRules: ['allow-downloads'],
  };
}
