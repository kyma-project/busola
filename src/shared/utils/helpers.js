import pluralize from 'pluralize';

// ownerSelector should be a subset of labels
export function matchBySelector(ownerSelector, labels) {
  if (!ownerSelector || !labels) return false;
  for (const [key, value] of Object.entries(ownerSelector)) {
    if (labels?.[key] !== value) {
      return false;
    }
  }
  return true;
}

export function matchByOwnerReference({ resource, owner }) {
  return resource.metadata.ownerReferences?.some(
    oR => oR.kind === owner.kind && oR.name === owner.metadata.name,
  );
}

export function getApiPath(resourceType, nodes) {
  const matchedNode = nodes.find(
    n =>
      n.resourceType === resourceType || n.navigationContext === resourceType,
  );
  try {
    const url = new URL(matchedNode?.viewUrl);
    return url.searchParams.get('resourceApiPath');
  } catch (e) {
    return null;
  }
}

export function findCommonPrefix(initialPrefix, words) {
  if (!words?.length) {
    return initialPrefix;
  }

  words.sort();
  const first = words[0];
  const last = words[words.length - 1];
  let biggestCommonPrefix = initialPrefix;
  while (
    first[biggestCommonPrefix.length] &&
    first[biggestCommonPrefix.length] === last[biggestCommonPrefix.length]
  ) {
    biggestCommonPrefix += first[biggestCommonPrefix.length];
  }

  return biggestCommonPrefix;
}

export function formatMessage(message = '', variables = {}) {
  const serializedVariables = {};
  for (let [key, value] of Object.entries(variables)) {
    if (!key.startsWith('{')) {
      key = `{${key}`;
    }
    if (!key.endsWith('}')) {
      key = `${key}}`;
    }

    if (value && isPrimitive(value)) {
      value = value.toString();
    } else {
      value = JSON.stringify(value || '');
    }

    serializedVariables[key] = value;
  }

  for (const variable in serializedVariables) {
    message = message.replace(variable, serializedVariables[variable]);
  }

  return message;
}

export function isPrimitive(type = null) {
  return (
    type === null || (typeof type !== 'function' && typeof type !== 'object')
  );
}

const capitalize = str => {
  return str?.charAt(0)?.toUpperCase() + str?.slice(1);
};

const splitName = name => {
  if (!name) return '';
  const nameArray = name.match(/[A-Z][a-z]+/g);
  return (nameArray || []).join(' ');
};

export const prettifyNamePlural = (resourceName, resourceType) => {
  return capitalize(resourceName) || splitName(capitalize(resourceType));
};
export const prettifyNameSingular = (resourceName, resourceType) => {
  const resources = prettifyNamePlural(resourceName, resourceType);
  return pluralize(resources, 1);
};

export const prettifyKind = kind => {
  const r = /([A-Z]+(?![a-z])|[A-Z][a-z]+)/g;
  const parts = kind?.match(r);
  return parts?.join(' ') || '';
};

export const getErrorMessage = (error, message = null) => {
  let errorNotification = message
    ? message
    : 'An error occured. The component cannot be rendered.';

  if (error?.message && typeof error?.originalMessage !== 'object') {
    errorNotification += `: ${error.message} `;
  }
  return errorNotification;
};

export const intersperse = (arr, sep) => arr.flatMap(el => [sep, el]).slice(1);

export const stringifyIfBoolean = val =>
  typeof val === 'boolean' ? JSON.stringify(val) : val;

export function buildPathsFromObject(object, path = '') {
  let result = [];

  for (const key in object) {
    const value = object[key];
    if (typeof value === 'object' && !Array.isArray(value)) {
      result = result.concat(
        buildPathsFromObject(value, path ? path + '.' + key : key),
      );
    } else {
      result.push(path + '.' + key);
    }
  }

  return result;
}
