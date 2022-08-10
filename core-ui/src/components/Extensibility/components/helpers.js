import { Widget } from './Widget';

export const getChildrenInfo = structure => {
  if (!Array.isArray(structure.children)) {
    const sortOptions = (structure.sort || []).reduce((acc, current) => {
      if (!current.path) {
        return [...acc];
      }

      const obj = {
        path: current.path,
        sort: { default: current.default, fn: current.fn },
      };
      return [...acc, obj];
    }, []);

    return { children: null, sortOptions, defaultSort: true };
  }

  const children = structure.children.map(({ name, ...props }) => ({
    header: name,
    value: value => <Widget value={value} structure={props} />,
  }));

  const sortOptions = (structure?.children || []).filter(child => child.sort);
  return { children, sortOptions, defaultSort: false };
};
