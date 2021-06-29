import { randomNamesGenerator } from './randomNamesGenerator/randomNamesGenerator';
import { MESSAGES } from '../components/GenericList/constants';

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
  return resources.slice(0, -1);
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
