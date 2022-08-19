import React, { createContext, useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import jsonata from 'jsonata';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { OrderedMap } from 'immutable';
import { Link } from 'shared/components/Link/Link';
import { jsonataWrapper } from './jsonataWrapper';
import { last } from 'lodash';
import { prettifyNamePlural } from 'shared/utils/helpers';

export const TranslationBundleContext = createContext({
  translationBundle: 'extensibility',
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

export const applyFormula = (value, formula, t, additionalSources) => {
  try {
    const expression = jsonataWrapper(formula);
    return expression.evaluate({ data: value, ...additionalSources });
  } catch (e) {
    return t('extensibility.configuration-error', { error: e.message });
  }
};

export const useGetTranslation = path => {
  const { translationBundle } = useContext(TranslationBundleContext);
  const { t, i18n } = useTranslation([translationBundle]);
  //doesn't always work, add `translationBundle.` at the beginning of a path

  const exists = path => i18n.exists(`${translationBundle}::${path}`);

  const widgetT = (def, options = {}) => {
    let value = '';
    if (def.name) {
      value = def.name;
    } else if (def.path) {
      const path = Array.isArray(def.path) ? def.path.join('.') : def.path;
      if (exists(path)) {
        value = path;
      } else {
        value = prettifyNamePlural(null, last(def.path));
      }
    }
    return t(`${translationBundle}::${value}`, {
      ...options,
      defaultValue: value,
    });
  };

  const tFromStoreKeys = (storeKeys, schema, options) => {
    return widgetT({
      ...schema.toJS(),
      path: storeKeys.toArray().filter(el => typeof el === 'string'),
    });
  };

  return {
    t: (path, ...props) => t(`${translationBundle}::${path}`, ...props) || path,
    tFromStoreKeys,
    widgetT,
    exists,
    i18n,
  };
};

export function createTemplate(api, namespace, scope) {
  const { version, group, kind } = api;
  const apiVersion = group ? `${group}/${version}` : version;

  const template = {
    apiVersion,
    kind,
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

export const getObjectValueWorkaround = (
  schema,
  resource,
  storeKeys,
  value,
) => {
  // TODO the value obtained by ui-schema is undefined for this component
  if (schema.toJS().type === 'object') {
    value = OrderedMap(
      storeKeys.toArray().reduce((valueSoFar, currKey) => {
        return valueSoFar?.[currKey];
      }, resource),
    );
  }

  return value;
};

export const useCreateResourceDescription = descID => {
  const { t, i18n } = useGetTranslation();

  let trans = t(descID);

  if (typeof trans === 'string') {
    const i18VarRegex = /{{.*?}}/g;
    const matchesIterator = trans?.matchAll(i18VarRegex);
    const matches = matchesIterator ? [...matchesIterator].flat() : null;

    if (matches.length) {
      matches.forEach((link, inx) => {
        const linkText = link.match(/\[(.*?)]/)[1];
        trans = trans.replace(link, `<${inx}>${linkText}</${inx}>`);
      });
      return (
        <Trans
          i18nKey={trans}
          i18n={i18n}
          components={matches.map((result, idx) => {
            const url = result.match(/\((.*?)\)/)[1];

            return <Link className="fd-link" url={url} key={idx} />;
          })}
        />
      );
    } else {
      return trans;
    }
  }
};

export const throwConfigError = (message, code) => {
  const e = new Error(message, { cause: code });
  e.name = 'Extensibility Config Error';
  throw e;
};
