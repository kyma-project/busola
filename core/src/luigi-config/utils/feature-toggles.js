export function updateFeatureToggle(key, value) {
  if (value) {
    Luigi.featureToggles().setFeatureToggle(key);
  } else {
    Luigi.featureToggles().unsetFeatureToggle(key);
  }
}

export function getFeatureToggle(key) {
  return (Luigi.featureToggles().getActiveFeatureToggles() || []).includes(key);
}

export function setFeatureToggle(key, value) {
  localStorage.setItem(`busola.${key}`, value);
  updateFeatureToggle(key, value);
}

export function readFeatureToggle(key) {
  const value = localStorage.getItem(`busola.${key}`) === 'true';
  console.log('readFeatureToggle', key, value);
  updateFeatureToggle(key, value);
}

export function readFeatureToggles(keys) {
  keys.forEach(readFeatureToggle);
}
