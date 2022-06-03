import pluralize from 'pluralize';
import schema from './schema.json';
import { Draft07 as Core } from 'json-schema-library';
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

export const validateResourceBySchema = (res, rule) => {
  console.log('sch', schema);

  const errors = schema.rules.reduce(
    (accumulator, currentRule, index, array) => {
      try {
        // why for these two libraries the 'kind' isnt checked properly id 22, 53, 54 <-
        //there is name
        // Core works slower
        const core = new Core(currentRule.schema);
        const result = core.isValid(res);
        // const schemaValidator = validator(currentRule.schema);
        // const result = schemaValidator(res);
        if (!currentRule.enabledByDefault) return [...accumulator];
        if (!result) return [currentRule.messageOnFailure, ...accumulator];
        return [...accumulator];
      } catch (e) {
        // console.log('catchxd', e);
        return [...accumulator];
      }
    },
    [],
  );

  console.log(errors);
};
