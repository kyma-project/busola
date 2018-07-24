export const sortDocumentsByType = documents => {
  if (!documents) return null;

  const docs = documents.docs || documents.Docs || null;

  if (documents && docs) {
    return docs.reduce((obj, document) => {
      const key = document.type ? 'type' : 'Type';
      const val = document[key];

      if (!obj[val]) {
        obj[val] = [];
      }
      obj[val].push(document);
      return obj;
    }, {});
  }
  return null;
};

export const getDocumentsTypes = (items, docsSortedByType) => {
  let documentsTypes = [];
  if (items) {
    if (docsSortedByType) documentsTypes = Object.keys(docsSortedByType);
    if (items.apiSpec) documentsTypes.push('Console');
    if (items.asyncApiSpec) documentsTypes.push('Events');
  }
  return documentsTypes;
};

export const getResourceDisplayName = resource => {
  if (!resource) {
    return null;
  }

  return resource.displayName || resource.externalName || resource.name;
};

export function clearEmptyPropertiesInObject(o) {
  for (const k in o) {
    if (typeof o[k] === 'undefined' || o[k] === "") {
      delete o[k];
      continue;
    }

    if (!o[k] || typeof o[k] !== 'object') {
      continue;
    }

    clearEmptyPropertiesInObject(o[k]);
    if (Object.keys(o[k]).length === 0) {
      delete o[k];
    }
  }
}
