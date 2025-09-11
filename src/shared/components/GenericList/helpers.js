const getLabelStrings = (entry) => {
  const labels = entry.metadata?.labels || [];
  return Object.entries(labels).map(([key, val]) =>
    `${key}=${val}`.toLowerCase(),
  );
};

const match = (entry, query) => {
  return (
    entry &&
    entry.toString().toLowerCase().includes(query.toString().toLowerCase())
  );
};

const matchArray = (array, query) => array.find((e) => match(e, query));

const isPrimitive = (type) => {
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

export const getEntryMatches = async (entry, query, searchProperties) => {
  if (typeof entry === 'string') {
    if (match(entry, query)) return [entry];
  }

  const flattenedEntry = flattenProperties(entry);
  const flattenedSearchProperties = await Promise.all(
    searchProperties?.map(async (property) => {
      if (
        typeof property === 'function' ||
        typeof property?.then === 'function'
      ) {
        return await property(entry, query);
      }
      if (property === 'metadata.labels' && entry.metadata?.labels) {
        return getLabelStrings(entry).filter((label) => match(label, query));
      } else if (Array.isArray(flattenedEntry[property])) {
        return matchArray(flattenedEntry[property], query);
      } else if (match(flattenedEntry[property], query)) {
        return flattenedEntry[property];
      } else {
        return null;
      }
    }),
  );
  const resolvedSearchProperties = flattenedSearchProperties.flat();
  return resolvedSearchProperties.filter((match) => match) || [];
};

const filterEntry = async (entry, query, searchProperties) => {
  if (!query) {
    return true;
  }

  const matches = await getEntryMatches(entry, query, searchProperties);
  return !!matches.length;
};

export const filterEntries = async (entries, query, searchProperties) => {
  const result = await Promise.all(
    entries.map(async (entry) => {
      const isMatch = await filterEntry(entry, query, searchProperties);
      return isMatch ? entry : isMatch;
    }),
  );
  return result.filter(Boolean);
};
