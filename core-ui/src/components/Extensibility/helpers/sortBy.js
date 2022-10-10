export const getSortingFunction = (jsonata, formula, originalResource) => {
  return (a, b) => {
    const [aValue] = jsonata(formula, { scope: a });
    const [bValue] = jsonata(formula, { scope: b });

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

export const applySortFormula = (jsonata, formula, t) => {
  try {
    return (a, b) => {
      if (a === undefined) return -1;
      if (b === undefined) return 1;
      return jsonata(formula, {
        scope: {
          first: a,
          second: b,
        },
      })[0];
    };
  } catch (e) {
    return t('extensibility.configuration-error', { error: e.message });
  }
};

export const sortBy = (
  jsonata,
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
      let sortFn = getSortingFunction(jsonata, source, originalResource);

      if (sort.compareFunction) {
        sortFn = (a, b) => {
          const [aValue] = jsonata(source, { scope: a });
          const [bValue] = jsonata(source, { scope: b });

          const sortFormula = applySortFormula(
            jsonata,
            sort.compareFunction,
            t,
          );
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
