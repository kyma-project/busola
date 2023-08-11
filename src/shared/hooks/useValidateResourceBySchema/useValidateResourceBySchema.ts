import { useMemo } from 'react';
import { Options, Validator } from 'jsonschema';
import { K8sResource } from 'types';
import { ValidationSchema } from 'state/validationSchemasAtom';

export type Warning =
  | {
      key?: string;
      message?: string;
      link?: string;
      category?: string;
    }
  | string;

export const validateResourceBySchema = (
  resource: K8sResource,
  schema?: ValidationSchema,
  options?: Options,
) => {
  const warnings = (schema?.rules || [])
    .map(currentRule => {
      try {
        const schemaValidator = new Validator();
        const result = schemaValidator.validate(
          resource,
          currentRule.schema,
          options,
        );

        if (result.errors.length > 0) {
          return {
            key: currentRule.uniqueName,
            message: currentRule.messageOnFailure,
            link: currentRule.documentationUrl,
            category: currentRule.category,
          } as Warning;
        }

        return undefined;
      } catch {
        return undefined;
      }
    })
    .filter(value => value !== undefined);

  return warnings as Warning[];
};

export const useValidateResourceBySchema = (
  resource: K8sResource,
  validationSchema: ValidationSchema,
) => {
  return useMemo(() => {
    return validateResourceBySchema(resource, validationSchema);
  }, [resource, validationSchema]);
};
