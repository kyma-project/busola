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
  const { t } = useTranslation([translationBundle]); //doesn't always work, add `translationBundle.` at the beggining of a path

  return {
    t: (path, ...props) => t(`${translationBundle}:${path}`, ...props) || path,
    widgetT: (def, options = {}) => {
      const path = def.name || def.path;
      return t(`${translationBundle}:${path}`, {
        ...options,
        defaultValue: path?.split('.')?.pop(),
      });
    },
  };
};

export function createTemplate(api, namespace, scope) {
  const template = {
    apiVersion: `${api.group}/${api.version}`,
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
