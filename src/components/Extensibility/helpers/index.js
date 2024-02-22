import { createContext, useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { OrderedMap } from 'immutable';
import { last, merge } from 'lodash';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { prettifyNamePlural } from 'shared/utils/helpers';

import { jsonataWrapper } from './jsonataWrapper';

export const TranslationBundleContext = createContext({
  translationBundle: 'extensibility',
});

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

    return exists(value)
      ? t(`${translationBundle}::${value}`, {
          ...options,
          defaultValue: value,
        })
      : value;
  };

  const tFromStoreKeys = (storeKeys, schema, options) => {
    return widgetT({
      ...schema.toJS(),
      path: storeKeys.toArray().filter(el => typeof el === 'string'),
    });
  };

  return {
    t: (path, ...props) => {
      const translation = exists(path)
        ? t(`${translationBundle}::${path}`, ...props)
        : path;
      return translation === 'undefined'
        ? undefined
        : translation === 'null'
        ? null
        : translation;
    },
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

export function getDefaultPreset(presets, emptyTemplate) {
  if (!presets || !presets.length) return null;
  const defaultPreset = presets.find(preset => preset.default === true);
  return defaultPreset
    ? merge({}, { value: emptyTemplate }, defaultPreset)
    : null;
}

export function usePreparePresets(presets, emptyTemplate) {
  const { t: tExt } = useGetTranslation();

  if (!presets || !presets.length) return null;

  const preparedPresets = presets.map(preset => ({
    ...merge({}, { value: emptyTemplate }, preset),
    name: tExt(preset.name),
  }));

  if (preparedPresets.length <= 1) return null;
  return preparedPresets;
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
  try {
    if (schema.toJS().type === 'object') {
      value = OrderedMap(
        storeKeys.toArray().reduce((valueSoFar, currKey) => {
          return valueSoFar?.[currKey];
        }, resource),
      );
    }
    return value;
  } catch {
    return {};
  }
};

const processTranslation = trans => {
  const i18VarRegex = /{{.*?}}/g;
  const matchesIterator = trans?.matchAll(i18VarRegex);
  const matches = matchesIterator ? [...matchesIterator].flat() : null;

  if (matches?.length) {
    matches.forEach((link, index) => {
      const linkReplacement = processLink(link, index);
      trans = trans.replace(link, linkReplacement);
    });
    return { matches: matches, trans: trans };
  } else return { matches: [], trans: trans };
};

const processLink = (link, index) => {
  let linkText;
  if (link.match(/\[(.*?)]/)) {
    linkText = link.match(/\[(.*?)]/)[1];
  } else {
    linkText = link.match(/\((.*?)\)/)[1];
  }
  return `<${index}>${linkText}</${index}>`;
};

export const useCreateResourceDescription = descID => {
  const { t, i18n } = useGetTranslation();
  if (!descID) return;

  const helmBracketsRegex = /{{"(.*?)"}}/g;
  const trans = t(descID.replace(helmBracketsRegex, '$1'));

  if (typeof trans === 'string') {
    const { matches, trans: processedTrans } = processTranslation(trans);
    if (matches.length) {
      return (
        <Trans
          i18nKey={processedTrans}
          i18n={i18n}
          t={t}
          components={matches.map((result, idx) => {
            const url = result.match(/\((.*?)\)/)[1];

            return <ExternalLink url={url} key={idx} />;
          })}
        />
      );
    } else {
      return processedTrans;
    }
  }
};

export const getResourceDescAndUrl = descID => {
  if (!descID)
    return {
      description: null,
      url: null,
    };

  const helmBracketsRegex = /{{"(.*?)"}}/g;
  let trans = descID.replace(helmBracketsRegex, '$1');

  if (typeof trans === 'string') {
    const { matches, trans: processedTrans } = processTranslation(trans);
    if (matches.length) {
      return {
        description: processedTrans,
        url: matches.map(result => result.match(/\((.*?)\)/)[1]),
      };
    } else {
      return {
        description: processedTrans,
        url: null,
      };
    }
  }
};

export const throwConfigError = (message, code) => {
  const e = new Error(message, { cause: code });
  e.name = 'Extensibility Config Error';
  throw e;
};

export const getPropsFromSchema = (schema, required, t) => {
  const schemaRequired = schema.get('required');
  const inputInfo = schema.get('inputInfo');
  const tooltipContent = schema.get('description');

  return {
    required: schemaRequired ?? required,
    inputInfo: t(inputInfo),
    tooltipContent: t(tooltipContent),
  };
};

const isValueMatching = (value, input) => {
  return (value ?? '')
    .toString()
    .toLowerCase()
    .includes(input.toString().toLowerCase());
};

const getSearchingFunction = (searchOption, originalResource) => {
  const { source, search } = searchOption;
  return (entry, input) => {
    try {
      const value =
        jsonataWrapper(source).evaluate(originalResource ?? entry, {
          item: entry,
        }) || '';

      if (!search?.searchFunction)
        return isValueMatching(value, input) ? value : null;

      const jsonata = jsonataWrapper(search?.searchFunction);
      jsonata.assign('input', input);

      const foundValues = jsonata.evaluate(originalResource ?? entry, {
        item: entry,
        input,
      });

      return foundValues;
    } catch (e) {
      return null;
    }
  };
};

const searchingFunctions = (searchOptions, originalResource) =>
  (searchOptions || []).map(searchOption =>
    getSearchingFunction(searchOption, originalResource),
  );

export const getTextSearchProperties = ({
  searchOptions,
  originalResource = null,
  defaultSearch,
}) => {
  return (defaultSearchProperties = []) => [
    ...(defaultSearch ? defaultSearchProperties : []),
    ...searchingFunctions(searchOptions, originalResource),
  ];
};
