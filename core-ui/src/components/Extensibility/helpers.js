import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import pluralize from 'pluralize';
import jsonata from 'jsonata';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export const TranslationBundleContext = createContext({
  translationBundle: 'extensibility',
  defaultResourcePlaceholder: '',
});

export const getValue = (resource, path) => {
  if (!resource) return undefined;
  if (!path || path === '$') return resource;

  if (path.startsWith('$.')) {
    return jp.value(resource, path);
  } else if (path.startsWith('[')) {
    return jp.value(resource, '$' + path);
  }
  return jp.value(resource, '$.' + path);
};
export const ApplyFormula = (value, formula, i18n) => {
  const { t } = useTranslation(null, { i18n });
  let result;
  try {
    let expression = jsonata(formula);
    result = expression.evaluate({ data: value });
  } catch (e) {
    result = t('extensibility.configuration-error', { error: e.message });
  }

  return result;
};

export const useGetTranslation = path => {
  const { translationBundle } = useContext(TranslationBundleContext);
  const { t, i18n } = useTranslation([translationBundle]);
  //doesn't always work, add `translationBundle.` at the beginning of a path

  return {
    t: (path, ...props) => t(`${translationBundle}::${path}`, ...props) || path,
    tFromStoreKeys: (storeKeys, ...props) => {
      const path = storeKeys
        .toArray()
        .filter(el => typeof el === 'string') // get rid of numbers i.e. spec.ports[2].protocol
        .join('.');

      return t(`${translationBundle}::${path}`, ...props) || path;
    },
    widgetT: (def, options = {}) => {
      const items = Array.isArray(def) ? def : [def];
      const path = items.map(item => item.name || item.path).join('.');
      return t(`${translationBundle}::${path}`, {
        ...options,
        defaultValue: path,
      });
    },
    exists: path => i18n.exists(`${translationBundle}:${path}`),
  };
};

export function createTemplate(api, namespace, scope) {
  const template = {
    apiVersion:
      api.group === 'core' || api.group === ''
        ? api.version
        : `${api.group}/${api.version}`,
    kind: pluralize(api.kind, 1),
    metadata: {
      name: '',
      labels: {},
      annotations: {},
    },
    spec: {},
  };
  if (namespace && scope === 'namespace')
    template.metadata.namespace = namespace;
  return template;
}

export const useGetPlaceholder = structure => {
  const { t } = useGetTranslation();
  const { defaultResourcePlaceholder } = useContext(TranslationBundleContext);

  let emptyLeafPlaceholder = '';
  if (structure?.placeholder) {
    emptyLeafPlaceholder = t(structure.placeholder);
  } else if (defaultResourcePlaceholder) {
    emptyLeafPlaceholder = t(defaultResourcePlaceholder);
  } else {
    emptyLeafPlaceholder = EMPTY_TEXT_PLACEHOLDER;
  }

  return { emptyLeafPlaceholder };
};
