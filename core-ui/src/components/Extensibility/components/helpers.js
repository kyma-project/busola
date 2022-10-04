import { Widget } from './Widget';

const shouldUseDefaultColumns = structure => !Array.isArray(structure.children);

const getSortOptions = structure => {
  if (!shouldUseDefaultColumns(structure)) {
    return structure.children.filter(child => child.sort);
  }

  return (structure?.sort || []).reduce((acc, current) => {
    if (!current.source) {
      return [...acc];
    }

    const sortOption = {
      source: current.source,
      sort: {
        default: current.default,
        compareFunction: current.compareFunction,
      },
    };
    return [...acc, sortOption];
  }, []);
};

export const getSortDetails = structure => {
  const sortOptions = getSortOptions(structure);
  return { sortOptions, defaultSort: shouldUseDefaultColumns(structure) };
};

const getSearchOptions = structure => {
  if (!shouldUseDefaultColumns(structure)) {
    return structure.children.filter(child => child.search);
  }

  return (structure?.search || []).reduce((acc, current) => {
    if (!current.source) {
      return [...acc];
    }

    const searchOption = {
      source: current.source,
      search: {
        searchFunction: current.searchFunction,
      },
    };
    return [...acc, searchOption];
  }, []);
};

export const getSearchDetails = structure => {
  const searchOptions = getSearchOptions(structure);
  return { searchOptions, defaultSearch: shouldUseDefaultColumns(structure) };
};

export const getChildren = (structure, originalResource) => {
  if (shouldUseDefaultColumns(structure)) {
    return null;
  }

  const children = structure.children.map(({ name, ...props }) => ({
    header: name,
    value: value => (
      <Widget
        value={value}
        structure={props}
        originalResource={originalResource}
      />
    ),
  }));

  return children;
};
