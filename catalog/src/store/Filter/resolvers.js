import gql from 'graphql-tag';

export default {
  Query: {
    serviceClassFilters: (_, args, { cache }) => {
      const result =
        cache.readQuery({
          query: gql`
            query ServiceClassesFilterData {
              serviceClasses {
                name
                providerDisplayName
                tags
              }
            }
          `,
        }) || [];

      return populateServiceClassFilters(result.serviceClasses);
    },
  },
  Mutation: {
    setActiveFilters: (_, args, { cache }) => {
      const filters = cache.readQuery({
        query: gql`
          query activeServiceClassFilters {
            activeServiceClassFilters @client {
              provider
              category
            }
          }
        `,
      }).activeServiceClassFilters;

      const newActive = { ...filters };
      newActive[args.key] = args.value;

      cache.writeData({
        data: {
          activeServiceClassFilters: newActive,
        },
      });

      return newActive;
    },
    filterServiceClasses: (_, args, { cache }) => {
      const activeFilters = cache.readQuery({
        query: gql`
          query activeServiceClassFilters {
            activeServiceClassFilters @client {
              provider
              category
              search
            }
          }
        `,
      }).activeServiceClassFilters;

      const classes = cache.readQuery({
        query: gql`
          query ServiceClasses {
            serviceClasses {
              name
              description
              displayName
              externalName
              imageUrl
              activated
              providerDisplayName
              tags
            }
          }
        `,
      }).serviceClasses;
      const filteredClasses = filterServiceClasses(
        classes,
        activeFilters,
        cache,
      );
      const classFilters = populateServiceClassFilters(
        classes,
        filteredClasses,
      );

      cache.writeData({
        data: {
          serviceClassFilters: classFilters,
          filteredServiceClasses: filteredClasses,
        },
      });

      return classes;
    },
  },
};

const populateServiceClassFilters = (allItems, filteredItems = []) => {
  if (allItems.length === 0) {
    return [];
  }

  const providers = [];
  const categories = [];
  allItems.forEach(item => {
    if (item) {
      if (item.providerDisplayName) {
        providers.push(item.providerDisplayName);
      }
      categories.push(...item.tags);
    }
  });

  const filteredProviders = [];
  const filteredCategories = [];
  filteredItems.forEach(item => {
    if (item) {
      if (item.providerDisplayName) {
        filteredProviders.push(item.providerDisplayName);
      }
      filteredCategories.push(...item.tags);
    }
  });

  return [
    {
      name: 'category',
      values: getFilterValues(categories, filteredCategories),
      __typename: 'Filter',
    },
    {
      name: 'provider',
      values: getFilterValues(providers, filteredProviders),
      __typename: 'Filter',
    },
  ];
};

const getFilterValues = (values, filteredValues = []) => {
  const uniqueValues = new Set(values);
  const valuesCount = filteredValues.reduce((filteredValues, item) => {
    const prevCount = filteredValues[item];
    filteredValues[item] = (prevCount ? prevCount : 0) + 1;
    return filteredValues;
  }, {});

  const valuesMap = [...uniqueValues].reduce((values, item) => {
    const countVal = valuesCount[item];
    values[item] = {
      name: item,
      value: item,
      count: typeof countVal === 'number' ? countVal : 0,
      __typename: 'FilterItem',
    };
    return values;
  }, {});

  const valuesArray = Object.values(valuesMap);
  valuesArray.unshift({
    name: 'All',
    value: null,
    count: null,
    __typename: 'FilterItem',
  });
  return valuesArray;
};

const filterServiceClasses = (classes, activeFilters, cache) => {
  const filteredClasses = classes.filter(item => {
    let providerMatch = true;
    let categoryMatch = true;
    let searchMatch = true;

    if (activeFilters.provider) {
      providerMatch = item.providerDisplayName === activeFilters.provider;
    }

    if (activeFilters.category) {
      categoryMatch = item.tags.includes(activeFilters.category);
    }

    if (
      typeof activeFilters.search === 'string' &&
      activeFilters.search !== ''
    ) {
      const searchValue = activeFilters.search.toLowerCase();
      const name = item.displayName.toLowerCase();
      const description = item.description.toLowerCase();
      searchMatch =
        name.indexOf(searchValue) !== -1 ||
        description.indexOf(searchValue) !== -1;
    }

    return providerMatch && categoryMatch && searchMatch;
  });

  return filteredClasses;
};
