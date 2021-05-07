export function setShowSystemNamespaces(showSystemNamespaces) {
  localStorage.setItem('busola.showSystemNamespaces', showSystemNamespaces);
  updateFeatureToggles(showSystemNamespaces);
}

export function loadSystemNamespacesToggle() {
  const toggleValue = shouldShowSystemNamespaces();
  updateFeatureToggles(toggleValue);
}

export const shouldShowSystemNamespaces = () => {
  return localStorage.getItem('busola.showSystemNamespaces') === 'true';
};

function updateFeatureToggles(toggleValue) {
  const fn = toggleValue ? 'setFeatureToggle' : 'unsetFeatureToggle';
  Luigi.featureToggles()[fn]('showSystemNamespaces');
}
