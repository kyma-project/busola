import { useRef, useState, useEffect } from 'react';
import { Validator } from 'jsonschema';

const validateResourceBySchema = async resource => {
  const schema = await import('./schema.js');

  const warnings = (schema?.schema.rules || []).reduce(
    (accumulator, currentRule) => {
      try {
        const schemaValidator = new Validator();
        const result = schemaValidator.validate(resource, currentRule.schema);

        if (result.errors.length > 0)
          return [currentRule.messageOnFailure, ...accumulator];

        return [...accumulator];
      } catch {
        return [...accumulator];
      }
    },
    [],
  );

  return warnings;
};

export const useValidateResourceBySchema = resource => {
  const [warnings, setWarnings] = useState(() =>
    validateResourceBySchema(resource),
  );

  const intervalRef = useRef();

  useEffect(() => {
    clearTimeout(intervalRef.current);

    intervalRef.current = setTimeout(async () => {
      const warningMessages = await validateResourceBySchema(resource);
      setWarnings(warningMessages);
    }, 500);
  }, [resource]);

  return warnings;
};
