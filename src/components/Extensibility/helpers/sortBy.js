const isObject = (obj, key) => {
  return typeof obj === 'object' && key in obj;
};

const calc = (formula, first, second) => {
  const stringToCalc = formula
    ?.replace('first', first)
    ?.replace('second', second)
    ?.replaceAll(' ', '')
    ?.replaceAll('$', '');
  if (!stringToCalc) {
    return null;
  }
  // eslint-disable-next-line no-new-func
  const calculated = Function(`return(${stringToCalc})`)();
  if (!calculated || typeof calculated !== 'number') {
    return null;
  }
  return calculated;
};

export const getSortingFunction = (getJsonata, formula, originalResource) => {
  return (a, b) => {
    // If it is a simple object with key, we don't need to use jsonata which is expensive.
    const [aValue] = isObject(a, formula)
      ? [a[formula]]
      : getJsonata(formula, { scope: a });
    const [bValue] = isObject(b, formula)
      ? [b[formula]]
      : getJsonata(formula, { scope: b });

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
    // If it is a simple math operation, we don't need to use jsonata which is expensive.
    const calculated = calc(formula, a, b);
    const [result] = calculated
      ? [calculated]
      : getJsonata(formula, {
          scope: {
            first: a,
            second: b,
          },
        });
    return result;
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
          // If it is a simple object with key, we don't need to use jsonata which is expensive.
          const [aValue] = isObject(a, source)
            ? [a[source]]
            : getJsonata(source, { scope: a });
          const [bValue] = isObject(b, source)
            ? [b[source]]
            : getJsonata(source, { scope: b });

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
