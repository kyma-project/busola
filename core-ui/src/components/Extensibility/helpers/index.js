import React, { createContext, useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { OrderedMap } from 'immutable';
import { last, merge } from 'lodash';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Link } from 'shared/components/Link/Link';
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
    t: (path, ...props) => {
      const translation = t(`${translationBundle}::${path}`, ...props) || path;
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

export function usePreparePresets(resource, presets) {
  const { t: tExt } = useGetTranslation();
  const { t } = useTranslation();

  if (!presets || !presets.length) return null;

  const preparedPresets = presets.map(preset =>
    merge({}, { value: resource }, { ...preset, name: tExt(preset.name) }),
  );

  preparedPresets.unshift({
    name: t('common.create-form.clear-form'),
    value: resource,
  });

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

export const useCreateResourceDescription = descID => {
  const { t, i18n } = useGetTranslation();
  if (!descID) return;

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

export const applySortFormula = (formula, t) => {
  try {
    const sortFunction = jsonataWrapper(formula);
    return (a, b) => {
      sortFunction.assign('first', a);
      sortFunction.assign('second', b);
      if (a === undefined) return -1;
      if (b === undefined) return 1;
      return sortFunction.evaluate();
    };
  } catch (e) {
    return t('extensibility.configuration-error', { error: e.message });
  }
};

export const getSortingFunction = (formula, originalResource) => {
  return (a, b) => {
    const aValue = jsonataWrapper(formula).evaluate(originalResource || a, {
      item: a,
    });
    const bValue = jsonataWrapper(formula).evaluate(originalResource || b, {
      item: b,
    });

    switch (typeof aValue) {
      case 'number':
      case 'boolean':
      case 'undefined': {
        if (aValue === undefined) return -1;
        if (bValue === undefined) return 1;
        return aValue - bValue;
      }
      case 'string': {
        if (Date.parse(aValue)) {
          return new Date(aValue).getTime() - new Date(bValue).getTime();
        }
        return aValue.localeCompare(bValue);
      }
      default:
    }
  };
};

export const sortBy = (
  sortOptions,
  t,
  defaultSortOptions = {},
  originalResource = null,
) => {
  let defaultSort = {};
  const sortingOptions = (sortOptions || []).reduce(
    (acc, { name, source, sort }) => {
      const sortName = t(name, {
        defaultValue: name || source,
      });
      let sortFn = getSortingFunction(source, originalResource);

      if (sort.compareFunction) {
        sortFn = (a, b) => {
          const aValue = jsonataWrapper(source).evaluate(
            originalResource || a,
            {
              item: a,
            },
          );
          const bValue = jsonataWrapper(source).evaluate(
            originalResource || b,
            {
              item: b,
            },
          );
          const sortFormula = applySortFormula(sort.compareFunction, t);
          return sortFormula(aValue, bValue);
        };
      }

      if (sort.default) {
        defaultSort[sortName] = sortFn;
        return { ...acc };
      } else {
        acc[sortName] = sortFn;
        return { ...acc };
      }
    },
    {},
  );

  return { ...defaultSort, ...defaultSortOptions, ...sortingOptions };
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
    const value =
      jsonataWrapper(source).evaluate(originalResource ?? entry, {
        item: entry,
      }) || '';

    if (!search?.searchFormula)
      return isValueMatching(value, input) ? value : null;

    const jsonata = jsonataWrapper(search?.searchFormula);
    jsonata.assign('input', input);

    const doesSearchFormulaMatch = jsonata.evaluate(originalResource ?? entry, {
      item: entry,
      input,
    });

    return doesSearchFormulaMatch ? value : null;
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
  return defaultSearchProperties => [
    ...(defaultSearch ? defaultSearchProperties : []),
    ...searchingFunctions(searchOptions, originalResource),
  ];
};
