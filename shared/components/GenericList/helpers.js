const getLabelStrings = entry => {
  const labels = entry.metadata?.labels || [];
  return Object.entries(labels).map(([key, val]) =>
    `${key}=${val}`.toLowerCase(),
  );
};

const match = (entry, query) => {
  return (
    entry &&
    entry
      .toString()
      .toLowerCase()
      .includes(query.toLowerCase())
  );
};

const matchArray = (array, query) => array.find(e => match(e, query));

const isPrimitive = type => {
  return (
    type === null || (typeof type !== 'function' && typeof type !== 'object')
  );
};

const flattenProperties = (obj, prefix = '') =>
  Object.keys(obj).reduce((properties, key) => {
    const value = obj[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (isPrimitive(value)) {
      properties[prefixedKey] = value && value.toString();
    } else if (Array.isArray(value)) {
      properties[prefixedKey] = value;
    } else {
      Object.assign(properties, flattenProperties(value, prefixedKey));
    }

    return properties;
  }, {});

export const getEntryMatches = (entry, query, searchProperties) => {
  if (typeof entry === 'string') {
    if (match(entry, query)) return [entry];
  }

  const flattenedEntry = flattenProperties(entry);
  return (
    searchProperties
      ?.flatMap(property => {
        if (property === 'metadata.labels' && entry.metadata?.labels) {
          return getLabelStrings(entry).filter(label => match(label, query));
        } else if (Array.isArray(flattenedEntry[property])) {
          return matchArray(flattenedEntry[property], query);
        } else if (match(flattenedEntry[property], query)) {
          return flattenedEntry[property];
        } else {
          return null;
        }
      })
      .filter(match => match) || []
  );
};

const filterEntry = (entry, query, searchProperties) => {
  if (!query) {
    return true;
  }

  const matches = getEntryMatches(entry, query, searchProperties);
  return !!matches.length;
};

export const filterEntries = (entries, query, searchProperties) => {
  return entries.filter(entry => filterEntry(entry, query, searchProperties));
};
