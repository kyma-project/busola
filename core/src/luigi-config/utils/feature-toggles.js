export function updateFeatureToggle(key, value) {
  if (value) {
    console.log('updateFeatureToggle setFeatureToggle', key, value);
    Luigi.featureToggles().setFeatureToggle(key);
  } else {
    console.log('updateFeatureToggle unsetFeatureToggle', key);
    Luigi.featureToggles().unsetFeatureToggle(key);
    Luigi.configChanged();
  }
}

export function getFeatureToggle(key) {
  // const value = (Luigi.featureToggles().getActiveFeatureToggleList() || []).includes(
  //   key,
  // );
  const value = localStorage.getItem(`busola.${key}`) || false;
  console.log('getFeatureToggle core', key, value, value2);
  return value;
}

export function setFeatureToggle(key, value) {
  console.log('setFeatureToggle', key, value);
  localStorage.setItem(`busola.${key}`, value);
  updateFeatureToggle(key, value);
  Luigi.customMessages().sendToAll({
    id: `busola.toggle-changed.${key}`,
    value,
  });
}

export function readFeatureToggle(key) {
  const value = localStorage.getItem(`busola.${key}`) === 'true';
  // updateFeatureToggle(key, value);
}

export function readFeatureToggles(keys) {
  keys.forEach(readFeatureToggle);
  window.addEventListener(
    'message',
    event => {
      if (event.data.msg === 'busola.getFeatureToggle') {
        console.log('addEventListener busola.getFeatureToggle', event);
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
