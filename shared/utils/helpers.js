import { randomNamesGenerator } from './randomNamesGenerator/randomNamesGenerator';
import pluralize from 'pluralize';

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

export function randomNameGenerator(functionNames = []) {
  let name = '';
  do {
    name = randomNamesGenerator();
  } while (functionNames.includes(name));
  return name;
}

export function isPrimitive(type = null) {
  return (
    type === null || (typeof type !== 'function' && typeof type !== 'object')
  );
}

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
  return pluralize(resources, 1);
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
