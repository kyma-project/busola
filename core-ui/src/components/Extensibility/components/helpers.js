import { Widget } from './Widget';

const getSortOptions = structure => {
  if (Array.isArray(structure.children)) {
    return structure.children.filter(child => child.sort);
  }

  return (structure?.sort || []).reduce((acc, current) => {
    if (!current.source) {
      return [...acc];
    }

    const obj = {
      source: current.source,
      sort: {
        default: current.default,
        compareFunction: current.compareFunction,
      },
    };
    return [...acc, obj];
  }, []);
};

export const getSortDetails = structure => {
  const sortOptions = getSortOptions(structure);

  if (!Array.isArray(structure.children)) {
    return { sortOptions, defaultSort: true };
  }
  return { sortOptions, defaultSort: false };
};

const getSearchOptions = structure => {
  if (Array.isArray(structure.children)) {
    return structure.children.filter(child => child.search);
  }
  return (structure?.search || []).reduce((acc, current) => {
    if (!current.source) {
      return [...acc];
    }

    const obj = {
      source: current.source,
      search: {
        searchFormula: current.searchFormula,
      },
    };
    return [...acc, obj];
  }, []);
};

export const getSearchDetails = structure => {
  const searchOptions = getSearchOptions(structure);

  if (!Array.isArray(structure.children)) {
    return { searchOptions, defaultSearch: true };
  }
  return { searchOptions, defaultSearch: false };
};

export const getChildren = (structure, originalResource) => {
  if (!Array.isArray(structure.children)) {
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
