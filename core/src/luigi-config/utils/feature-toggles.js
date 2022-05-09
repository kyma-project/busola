export function updateFeatureToggle(key, value) {
  if (value) {
    Luigi.featureToggles().setFeatureToggle(key);
  } else {
    Luigi.featureToggles().unsetFeatureToggle(key);
    Luigi.configChanged();
  }
}

export function getFeatureToggle(key) {
  return localStorage.getItem(`busola.${key}`) || false;
}

export function setFeatureToggle(key, value) {
  localStorage.setItem(`busola.${key}`, value);
  updateFeatureToggle(key, value);
  Luigi.customMessages().sendToAll({
    id: `busola.toggle-changed.${key}`,
    value,
  });
}

export function readFeatureToggle(key) {
  const value = localStorage.getItem(`busola.${key}`) === 'true';
  updateFeatureToggle(key, value);
}

export function readFeatureToggles(keys) {
  keys.forEach(readFeatureToggle);
  window.addEventListener(
    'message',
    event => {
      if (event.data.msg === 'busola.getFeatureToggle') {
        event.source &&
          event.source.postMessage(
            {
              msg: 'busola.getFeatureToggle.response',
              key: event.data.key,
              value: getFeatureToggle(event.data.key),
            },
            event.origin,
          );
      }
    },
    false,
  );
}
