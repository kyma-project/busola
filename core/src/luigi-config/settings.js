export function createSettings(params) {
  return {
    responsiveNavigation: 'simpleMobileOnly',
    sideNavFooterText: '',
    header: {
      logo: 'assets/logo.svg',
      title: getTitle(params),
      favicon: 'favicon.ico',
    },
    appLoadingIndicator: {
      hideAutomatically: false,
    },
    customSandboxRules: ['allow-downloads'],
  };
}

function getTitle(params) {
  if (!params) {
    return 'Busola';
  } else {
    const cluster = params.cluster;
    return cluster.name || cluster.server.replace(/^https?:\/\/(api\.)?/, '');
  }
}
