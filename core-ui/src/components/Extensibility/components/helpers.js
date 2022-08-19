import { Widget } from './Widget';

export const getChildrenInfo = (structure, originalResource) => {
  if (!Array.isArray(structure.children)) {
    const sortOptions = (structure.sort || []).reduce((acc, current) => {
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

    return { children: null, sortOptions, defaultSort: true };
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

  const sortOptions = (structure?.children || []).filter(child => child.sort);

  return { children, sortOptions, defaultSort: false };
};
