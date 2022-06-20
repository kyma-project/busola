import pluralize from 'pluralize';
import { schema } from './schema.js';
const { validator } = require('@exodus/schemasafe');
export const getResourceKindUrl = resource => {
  return `/${resource?.apiVersion === 'v1' ? 'api' : 'apis'}/${
    resource?.apiVersion
  }`;
};

export const getResourceUrl = (resource, namespace) => {
  if (namespace === undefined) {
    namespace = resource?.metadata?.namespace;
  }

  const apiPath = getResourceKindUrl(resource);
  const namespacePart = namespace ? `/namespaces/${namespace}` : '';
  const resourceType = pluralize(resource?.kind?.toLowerCase());

  return `${apiPath}${namespacePart}/${resourceType}`;
};

export const validateResourceBySchema = res => {
  console.log('res');
  if (!res) return;
  const errors = schema.rules.reduce((accumulator, currentRule) => {
    try {
      const schemaValidator = validator(currentRule.schema);
      const result = schemaValidator(res);
      if (!currentRule.enabledByDefault) return [...accumulator];
      if (!result) return [currentRule.messageOnFailure, ...accumulator];
      return [...accumulator];
    } catch (e) {
      return [...accumulator];
    }
  }, []);
  return errors;
};
