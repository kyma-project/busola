export function createSettings(params) {
  return {
    responsiveNavigation: 'simpleMobileOnly',
    sideNavFooterText: '',
    header: {
      logo: 'assets/logo.svg',
      title: params?.currentContext.cluster.name || 'Busola',
      favicon: 'favicon.ico',
    },
    appLoadingIndicator: {
      hideAutomatically: false,
    },
    customSandboxRules: ['allow-downloads'],
  };
}
