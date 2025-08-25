export const getSortingFunction = (getJsonata, formula, originalResource) => {
  return (a, b) => {
    const [aValue] = getJsonata(formula, { scope: a });
    const [bValue] = getJsonata(formula, { scope: b });

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

export const applySortFormula = (getJsonata, formula, t) => {
  return (a, b) => {
    if (a === undefined) return -1;
    if (b === undefined) return 1;
    const [result] = getJsonata(formula, {
      scope: {
        first: a,
        second: b,
      },
    });
    // Sometimes some expression variables are read correctly only after removing the $.
    const [resultAfterReplace] = getJsonata(formula?.replaceAll('$', ''), {
      scope: {
        first: a,
        second: b,
      },
    });
    return result ?? resultAfterReplace;
  };
};

export const sortBy = (
  getJsonata,
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
      let sortFn = getSortingFunction(getJsonata, source, originalResource);

      if (sort.compareFunction) {
        sortFn = (a, b) => {
          const [aValue] = getJsonata(source, { scope: a });
          const [bValue] = getJsonata(source, { scope: b });

          const sortFormula = applySortFormula(
            getJsonata,
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
