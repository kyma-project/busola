const resolvers = {
  //leave the structure for the future when we add new options
  apiGroup: (selector, data) =>
    data?.apiGroups.find(g => g.groupVersion.includes(selector.apiGroup)),
};

async function resolveSelector(selector, data) {
  if (!resolvers[selector.type]) {
    throw Error('Unkown selector type ' + selector.type);
  } else {
    return await resolvers[selector.type](selector, data);
  }
}

export async function resolveFeatureAvailability(feature, data) {
  try {
    if (feature?.isEnabled === false) {
      return false;
    }
    for (const selector of feature.selectors || []) {
      if (!(await resolveSelector(selector, data))) {
        return false;
      }
    }
    return true;
  } catch (e) {
    console.warn(e);
    return false;
  }
}

export async function resolveFeatures(features, data) {
  const entries = await Promise.all(
    Object.entries(features).map(async ([name, feature]) => [
      name,
      {
        ...feature,
        isEnabled: await resolveFeatureAvailability(feature, data),
      },
    ]),
  );
  return Object.fromEntries(entries);
}
