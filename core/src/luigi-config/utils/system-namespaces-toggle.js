export function setShowHiddenNamespaces(showHiddenNamespaces) {
  localStorage.setItem('busola.showHiddenNamespaces', showHiddenNamespaces);
  updateFeatureToggles(showHiddenNamespaces);
}

export function loadHiddenNamespacesToggle() {
  const toggleValue = shouldShowHiddenNamespaces();
  updateFeatureToggles(toggleValue);
}

export const shouldShowHiddenNamespaces = () => {
  return localStorage.getItem('busola.showHiddenNamespaces') === 'true';
};

function updateFeatureToggles(toggleValue) {
  const fn = toggleValue ? 'setFeatureToggle' : 'unsetFeatureToggle';
  Luigi.featureToggles()[fn]('showHiddenNamespaces');
}
