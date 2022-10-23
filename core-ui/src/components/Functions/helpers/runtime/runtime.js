import { CONFIG } from 'components/Functions/config';
import { formatMessage } from 'components/Functions/helpers/misc';

import {
  PRETTY_RUNTIME_NODEJS14_NAME,
  PRETTY_RUNTIME_NODEJS16_NAME,
  PRETTY_RUNTIME_PYTHON39_NAME,
} from '../../constants';

export const nodejs14 = 'nodejs14';
export const nodejs16 = 'nodejs16';
export const python39 = 'python39';

export const functionAvailableLanguages = {
  // order of those keys is the same as order of available runtimes shown in Create Function Modal
  [nodejs16]: PRETTY_RUNTIME_NODEJS16_NAME,
  [nodejs14]: PRETTY_RUNTIME_NODEJS14_NAME,
  [python39]: PRETTY_RUNTIME_PYTHON39_NAME,
};

export const prettyRuntime = runtime =>
  functionAvailableLanguages[runtime] || `Unknown: ${runtime}`;

export const runtimeToMonacoEditorLang = runtime => {
  switch (runtime) {
    case python39:
      return {
        language: 'python',
        dependencies: 'plaintext',
      };
    case nodejs16:
    case nodejs14:
      return {
        language: 'javascript',
        dependencies: 'json',
      };
    default:
      return {
        language: 'plaintext',
        dependencies: 'plaintext',
      };
  }
};

export const getDefaultDependencies = (name, runtime) => {
  switch (runtime) {
    case python39:
      return CONFIG.defaultFunctionCodeAndDeps.python39.deps;
    case nodejs16:
    case nodejs14:
      return !name
        ? ''
        : formatMessage(CONFIG.defaultFunctionCodeAndDeps.nodejs14.deps, {
            functionName: name,
          });
    default:
      return '';
  }
};

export const checkDepsValidity = (runtime, deps) => {
  switch (runtime) {
    case nodejs16:
    case nodejs14:
      return deps.length === 0 || isJson(deps);
    default:
      return true;
  }
};

export const isJson = item => {
  if (typeof item !== 'string') {
    return false;
  }

  try {
    item = JSON.parse(item);
  } catch (e) {
    return false;
  }

  if (typeof item === 'object' && item !== null) {
    return true;
  }

  return false;
};
