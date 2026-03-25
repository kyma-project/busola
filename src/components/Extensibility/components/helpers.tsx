import { Widget } from './Widget';

const shouldUseDefaultColumns = (structure: any) =>
  !Array.isArray(structure.children);

const getSortOptions = (structure: any) => {
  if (!shouldUseDefaultColumns(structure)) {
    return structure.children.filter((child: any) => child.sort);
  }

  return (structure?.sort || []).reduce((acc: any[], current: any) => {
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

export const getSortDetails = (structure: any) => {
  const sortOptions = getSortOptions(structure);
  return { sortOptions, defaultSort: shouldUseDefaultColumns(structure) };
};

const getSearchOptions = (structure: any) => {
  if (!shouldUseDefaultColumns(structure)) {
    return structure.children.filter((child: any) => child.search);
  }

  return (structure?.search || []).reduce((acc: any[], current: any) => {
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

export const getSearchDetails = (structure: any) => {
  const searchOptions = getSearchOptions(structure);
  return { searchOptions, defaultSearch: shouldUseDefaultColumns(structure) };
};

export const getChildren = (structure: any, originalResource: any) => {
  if (shouldUseDefaultColumns(structure)) {
    return null;
  }

  const children = structure.children.map(({ name, ...props }: any) => ({
    header: name,
    value: (value: any) => (
      <Widget
        value={value}
        structure={props}
        originalResource={originalResource}
      />
    ),
  }));

  return children;
};
