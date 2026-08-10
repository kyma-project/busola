export const getSortingFunction = (jsonata, formula) => {
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
          if (bValue === undefined) return 1;
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

export const applySortFormula = (jsonata, formula) => {
  return async (a, b) => {
    if (a === undefined) return -1;
    if (b === undefined) return 1;
    const result = (
      await jsonata(formula, {
        scope: {
          first: a,
          second: b,
        },
        first: a,
        second: b,
      })
    )[0];
    return result;
  };
};

export const sortBy = (jsonata, sortOptions, t, defaultSortOptions = {}) => {
  const defaultSort = {};
  const sortingOptions = (sortOptions || []).reduce(
    (acc, { name, source, sort }) => {
      const sortName = t(name, {
        defaultValue: name || source,
      });
      let sortFn = getSortingFunction(jsonata, source);

      if (sort.compareFunction) {
        sortFn = {
          asyncFn: async (a, b) => {
            const [aValue] = await jsonata(source, { scope: a });
            const [bValue] = await jsonata(source, { scope: b });

            const sortFormula = applySortFormula(jsonata, sort.compareFunction);
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
  // Pre-compute results for every ordered pair (i, j) where i !== j.
  const results = new Map();
  await Promise.all(
    array.flatMap((a, i) =>
      array.map(async (b, j) => {
        if (i === j) return;
        const key = `${i}:${j}`;
        const result = isDesc ? await asyncFn(b, a) : await asyncFn(a, b);
        results.set(key, result);
      }),
    ),
  );

  const indexed = array.map((item, i) => ({ item, i }));
  indexed.sort((a, b) => results.get(`${a.i}:${b.i}`));
  return indexed.map(({ item }) => item);
};
