import { useRef, useState, useEffect } from 'react';
import { Validator } from 'jsonschema';

export const validateResourceBySchema = async (resource, schema, options) => {
  const warnings = (schema?.rules || []).reduce((accumulator, currentRule) => {
    try {
      const schemaValidator = new Validator();
      const result = schemaValidator.validate(
        resource,
        currentRule.schema,
        options,
      );

      if (result.errors.length > 0)
        return [currentRule.messageOnFailure, ...accumulator];

      return [...accumulator];
    } catch {
      return [...accumulator];
    }
  }, []);

  return warnings;
};

export const useValidateResourceBySchema = (resource, validationSchema) => {
  const [warnings, setWarnings] = useState(() =>
    validateResourceBySchema(resource),
  );

  const intervalRef = useRef();

  useEffect(() => {
    clearTimeout(intervalRef.current);

    intervalRef.current = setTimeout(async () => {
      // const schema = (await import('./podSecuritySchema.js')).podSecuritySchema;
      const schema = validationSchema;

      // console.log('import rules');
      // const loaded = await import('./defaultRules.yaml').catch(console.error);
      // console.log(loaded);
      // const schema = loaded.default;
      // console.log(schema);
      const warningMessages = await validateResourceBySchema(resource, schema);

      setWarnings(warningMessages);
    }, 500);
  }, [resource, validationSchema]);

  return warnings;
};
