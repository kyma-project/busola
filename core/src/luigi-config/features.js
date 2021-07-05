const resolvers = {
  //leave the structure for the future when we add new options
  apiGroup: (selector, data) =>
    data.crds.some(crd => crd.includes(selector.apiGroup)),
};

function resolveSelector(selector, data) {
  if (!resolvers[selector.type]) {
    throw Error('Unkown selector type ' + selector.type);
  } else {
    return resolvers[selector.type](selector, data);
  }
}

export function resolveFeatureAvailability(feature, data) {
  try {
    if (feature.isEnabled === false) {
      return false;
    }
    for (const selector of feature.selectors || []) {
      if (!resolveSelector(selector, data)) {
        return false;
      }
    }
    return true;
  } catch (e) {
    console.warn(e);
    return false;
  }
}

function setFeatureAvailability(feature, data) {
  const isEnabled = resolveFeatureAvailability(feature, data);
  feature.isEnabled = isEnabled;
}

export function resolveFeatures(features, data) {
  for (const featureName in features) {
    setFeatureAvailability(features[featureName], data);
  }
}
