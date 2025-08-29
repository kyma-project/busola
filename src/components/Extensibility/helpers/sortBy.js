export const getSortingFunction = (jsonata, formula, originalResource) => {
  return {
    asyncFn: async (a, b) => {
      const [aValue] = await jsonata(formula, { scope: a });
      const [bValue] = await jsonata(formula, { scope: b });

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
    },
  };
};

export const applySortFormula = (jsonata, formula, t) => {
  return async (a, b) => {
    if (a === undefined) return -1;
    if (b === undefined) return 1;
    const result = await jsonata(formula, {
      scope: {
        first: a,
        second: b,
      },
    })[0];
    return result;
  };
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
        sortFn = {
          asyncFn: async (a, b) => {
            const [aValue] = await jsonata(source, { scope: a });
            const [bValue] = await jsonata(source, { scope: b });

            const sortFormula = applySortFormula(
              jsonata,
              sort.compareFunction,
              t,
            );
            return await sortFormula(aValue, bValue);
          },
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

export const asyncSort = async (array, asyncFn, isDesc = false) => {
  let arrayOfSortPairs = [];
  // Fake sort to get all pairs to sort.
  array.sort((a, b) => {
    arrayOfSortPairs = [
      ...arrayOfSortPairs,
      {
        pair: [a, b],
      },
      {
        pair: [b, a],
      },
    ];
    return -1;
  });
  // Resolve async functions.
  const resolved = await Promise.all(
    arrayOfSortPairs.map(async el => {
      const [a, b] = el.pair;
      const resolvedResult = isDesc ? await asyncFn(b, a) : await asyncFn(a, b);
      return {
        pair: el.pair,
        result: resolvedResult,
      };
    }),
  );
  // Final sort.
  const final = array.sort((a, b) => {
    const findResultForPair = resolved.find(
      res => JSON.stringify([a, b]) === JSON.stringify(res.pair),
    )?.result;
    return findResultForPair;
  });
  return final;
};
