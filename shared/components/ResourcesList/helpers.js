const capitalize = str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const splitName = name => {
  const nameArray = name.match(/[A-Z][a-z]+/g);
  return nameArray.join(' ');
};

export const prettifyNamePlural = (resourceName, resourceType) => {
  return resourceName || splitName(capitalize(resourceType));
};

export const prettifyNameSingular = (resourceName, resourceType) => {
  const resources = prettifyNamePlural(resourceName, resourceType);
  return resources.slice(0, -1);
};
