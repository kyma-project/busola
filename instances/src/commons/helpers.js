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

export const getDocumentsTypes = (svcClass, docsSortedByType = {}) => {
  let documentsTypes = [];
  if (svcClass) {
    if (docsSortedByType) documentsTypes = Object.keys(docsSortedByType);
    if (svcClass.apiSpec) documentsTypes.push('Console');
    if (svcClass.asyncApiSpec) documentsTypes.push('Events');
  }
  return documentsTypes;
};

export const getResourceDisplayName = resource => {
  if (!resource) {
    return null;
  }

  return resource.displayName || resource.externalName || resource.name;
};
