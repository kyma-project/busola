const filterEntry = (entry, query, searchProperties) => {
  if (!query) {
    return true;
  }

  if (typeof entry === 'string') {
    return (
      entry &&
      entry
        .toString()
        .toLowerCase()
        .indexOf(query.toLowerCase()) !== -1
    );
  }

  if (!Object.keys(searchProperties).length) {
    return false;
  }

  const flattenedEntry = flattenProperties(entry);
  for (const property of searchProperties) {
    if (property === 'metadata.labels') {
      const labels = getLabelStrings(entry);
      if (
        labels.some(label => label.toLowerCase().includes(query.toLowerCase()))
      ) {
        return true;
      }
    } else if (flattenedEntry.hasOwnProperty(property)) {
      const value = flattenedEntry[property];
      // apply to string to include numbers
      if (
        value &&
        value
          .toString()
          .toLowerCase()
          .indexOf(query.toLowerCase()) !== -1
      ) {
        return true;
      }
    }
  }
  return false;
};

const flattenProperties = (obj, prefix = '') =>
  Object.keys(obj).reduce((properties, key) => {
    const value = obj[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (isPrimitive(value)) {
      properties[prefixedKey] = value && value.toString();
    } else if (Array.isArray(value)) {
      properties[prefixedKey] = JSON.stringify(value);
    } else {
      Object.assign(properties, flattenProperties(value, prefixedKey));
    }

    return properties;
  }, {});

const getLabelStrings = props => {
  const labels = props.metadata?.labels || [];
  return Object.entries(labels).map(([key, val]) =>
    `${key}=${val}`.toLowerCase(),
  );
};

const isPrimitive = type => {
  return (
    type === null || (typeof type !== 'function' && typeof type !== 'object')
  );
};

export const filterEntries = (entries, query, searchProperties) => {
  return entries.filter(entry => filterEntry(entry, query, searchProperties));
};
