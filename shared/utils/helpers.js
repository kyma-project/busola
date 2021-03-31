import { randomNamesGenerator } from '@kyma-project/common';

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
