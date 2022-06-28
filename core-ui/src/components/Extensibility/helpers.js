import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import pluralize from 'pluralize';

export const TranslationBundleContext = createContext('extensibility');

export const getValue = (resource, path) => {
  if (!resource) return undefined;
  if (!path || path === '$') return resource;

  if (path.startsWith('$.')) {
    return jp.value(resource, path);
  }
  return jp.value(resource, '$.' + path);
};

export const useGetTranslation = path => {
  const translationBundle = useContext(TranslationBundleContext);
  const { t, i18n } = useTranslation([translationBundle]);
  //doesn't always work, add `translationBundle.` at the beggining of a path

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
